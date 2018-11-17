import React, {Component} from 'react';
import PropTypes from 'prop-types';
import pathToRegexp from 'path-to-regexp';

export default class Switch extends Component {
    static contextTypes = {
        location: PropTypes.object
    }
    
    render() {
        let {pathname} = this.context.location;
        
        let children = this.props.children;
        for (let i = 0, l = children.length; i < l; i++) {
            let child = children[i];
            let path = child.props.path;
            
            if (pathToRegexp(path, [], {end: false}).test(pathname)) {
                // 将匹配到的第一个元素返回
                return child;
            }
        }
        return null
    }
}