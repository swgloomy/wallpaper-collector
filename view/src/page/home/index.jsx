import React from 'react';
import './index.pcss'
import style from './index.pcss.json'
import Menu from "../../components/menu";
import axios from "axios";
import {Button, message, Modal, Spin} from "antd";
import qs from "qs";

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            list: [],
            pageIndex: 1,
            loading: false,
            isImgPreview: false,
            imgPreview: ''
        }
        this.content = React.createRef()
    }

    componentDidMount() {
        this.wallpaperGetImgList()
        this.scrollBottom()
    }

    closeImgPreview = () => {
        this.setState({isImgPreview: false})
    }

    wallpaperGetImgList = () => {
        this.setState({loading: true})
        axios.get("http://127.0.0.1:8082/wallHavenTopList", {
            params: {
                pageIndex: this.state.pageIndex
            }
        }).then(res => {
            const {data: {code, data}} = res
            if (code === 200) {
                this.setState({list: [...this.state.list, ...data]}, this.judgmentScrollBottom)
            }
        }).finally(_ => {
            this.setState({loading: false})
        })
    }

    showPreview = previewUrl => {
        this.setState({loading: true})
        axios.post("http://127.0.0.1:8082/wallHavenImgPreview", qs.stringify({imgUrl: previewUrl}), {headers: {'content-type': 'application/x-www-form-urlencoded'}}).then(res => {
            const {data: {code, msg, data}} = res
            if (code === 200) {
                this.setState({imgPreview: data, isImgPreview: true})
            } else {
                message.error(msg);
            }
        }).finally(_ => {
            this.setState({loading: false})
        })
    }

    scrollBottom = () => {
        this.content.current.onscroll = this.judgmentScrollBottom
    }

    judgmentScrollBottom = () => {
        const content = this.content.current
        let scrollHeight = content.scrollHeight,
            scrollTop = content.scrollTop,
            clientHeight = content.clientHeight
        if (scrollHeight - clientHeight === scrollTop) {
            this.setState({pageIndex: this.state.pageIndex + 1}, this.wallpaperGetImgList)
        }
    }

    fileDownLoad = () => {
        globalThis.api.send('downUrlLoad', this.state.imgPreview)
    }

    setWallpaper = () => {
        this.setState({loading: true, isImgPreview: false})
        axios.post("http://127.0.0.1:8082/saveImage", qs.stringify({imgUrl: this.state.imgPreview}), {headers: {'content-type': 'application/x-www-form-urlencoded'}}).then(res => {
            const {data: {code, msg, data}} = res
            if (code === 200) {
                globalThis.api.send('setWallpaper', data)
                message.success('壁纸设置成功!')
            } else {
                message.error(msg);
            }
        }).finally(_ => {
            this.setState({loading: false})
        })
    }

    render() {
        return (
            <>
                <Menu/>
                <div className={style.contentArea} ref={this.content}>
                    <Spin spinning={this.state.loading} wrapperClassName={style.loading} tip="数据加载中...">
                        <ul>
                            {
                                this.state.list.map((item, index) =>
                                    <li className={style.imgArea} key={index}>
                                        <figure className={style.picture}>
                                            <div className={style.img}>
                                                <img onClick={_ => {
                                                    this.showPreview(item.img_preview)
                                                }}
                                                     src={item.img_url} alt=""/>
                                                <div className={style.thumbInfo}>
                                                    <span className={style.star}>Star {item.star}</span>
                                                    <span className={style.imgSize}>{item.img_size}</span>
                                                </div>
                                            </div>
                                        </figure>
                                    </li>
                                )
                            }
                        </ul>
                    </Spin>
                </div>
                <Modal title="图片预览" visible={this.state.isImgPreview} onOk={this.closeImgPreview}
                       okText="down"
                       onCancel={this.closeImgPreview}
                       footer={[
                           <Button key="back" onClick={this.closeImgPreview}>
                               Close
                           </Button>,
                           <Button type="primary" onClick={this.fileDownLoad}>
                               DownLoad
                           </Button>,
                           <Button type="primary" onClick={this.setWallpaper}>
                               SetWallpaper
                           </Button>
                       ]}>
                    <img className={style.previewImg} src={this.state.imgPreview} alt=""/>
                </Modal>
            </>
        );
    }
}

export default Home;