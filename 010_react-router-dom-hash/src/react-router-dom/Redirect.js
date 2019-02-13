import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class Redirect extends Component {
    // 定义上下文context的Type
    static contextTypes = {
        history: PropTypes.object
    }
    
    componentDidMount() {
        // 跳转到目标路由
        this.context.history.push(this.props.to);
    }
    
    render() {
        return null;
    }
}