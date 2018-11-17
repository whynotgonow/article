import React, {Component} from 'react';
import PropTypes from 'prop-types';
import pathToRegexp from 'path-to-regexp'

export default class Route extends Component {
    // 定义上下文context的类型
    static contextTypes = {
        location: PropTypes.object,
        history: PropTypes.object
    }
    
    render() {
        // 解构传入Route的props
        let {path, component: Component, render, children} = this.props;
        
        // 解构上下文的属性
        let {location, history} = this.context;
        let props = {
            location,
            history
        };
        
        // 将传入Route的path和当前的hash进行匹配
        let keys = [];
        let regexp = pathToRegexp(path, keys, {end: false});
        keys = keys.map(key => key.name);
        
        let result = location.pathname.match(regexp);
        
        if (result) { // 匹配上了
            let [url, ...values] = result;
            props.match = {
                path,
                url,
                params: keys.reduce((memo, key, index) => { // 获取匹配到的参数
                    memo[key] = values[index];
                    return memo;
                }, {})
            };
            
            if (Component) { // 普通的Route
                return <Component {...props} />;
            } else if (render) { // 特定逻辑的渲染
                return render(props);
            } else if (children) { // MenuLink的渲染
                return children(props);
            } else {
                return null;
            }
        } else { // 没有匹配上
            if (children) { // MenuLink的渲染
                return children(props);
            } else {
                return null;
            }
        }
    }
}