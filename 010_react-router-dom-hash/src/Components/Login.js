import React, {Component} from 'react';

export default class Login extends Component {
    handleLogin = () => {
        localStorage.setItem('login', true);
        let from = this.props.location.state.from;
        this.props.history.push(from);
    }
    
    render() {
        return <button onClick={this.handleLogin} className="btn btn-primary">登录</button>
    }
}