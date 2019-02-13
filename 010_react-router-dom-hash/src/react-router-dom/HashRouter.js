import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class HashRouter extends Component {
    constructor() {
        super();
        this.state = {
            location: {
                pathname: window.location.hash.slice(1) || '/', // 当前页面的hash值
                state: {}   //保存的状态
            }
        };
    }
    
    // 定义上下文的变量类型
    static childContextTypes = {
        location: PropTypes.object,
        history: PropTypes.object
    }
    
    // 定义上下文的变量
    getChildContext() {
        return {
            location: this.state.location,
            history: {
                push: (path) => { // 就是更新 window.hash值
                    if (typeof path === 'object') {
                        let {pathname, state} = path;
                        this.setState({
                            location: {
                                ...this.state.location,
                                state // {from: '/profile'}
                            }
                        }, () => {
                            window.location.hash = pathname;
                        })
                    } else {
                        window.location.hash = path;
                    }
                }
            }
        }
    }
    
    render() {
        return this.props.children; // 渲染页面元素
    }
    
    componentDidMount() {
        window.location.hash = window.location.hash.slice(1) || '/';
        // 监听window的hash的变化，驱动页面的重新刷新
        window.addEventListener('hashchange', () => {
            this.setState({
                location: {
                    ...this.state.location,
                    pathname: window.location.hash.slice(1) || '/'
                }
            });
        })
    }
}