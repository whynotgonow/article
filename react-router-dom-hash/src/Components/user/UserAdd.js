import React, {Component} from 'react';

export default class UserAdd extends Component {
    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <div className="form-group">
                    <label>用户名</label>
                    <input ref={input => this.input = input} type="text" className="form-control"/>
                </div>
                <div className="form-group">
                    <button className="btn btn-primary">提交</button>
                </div>
            </form>
        )
    }
    
    handleSubmit = (e) => {
        e.preventDefault();
        let username = this.input.value;
        
        let userStr = localStorage.getItem('users');
        let users = userStr ? JSON.parse(userStr) : [];
        users.push({
            username,
            id: Date.now()
        });
        
        localStorage.setItem('users', JSON.stringify(users));
        this.props.history.push('/user/list');// window.location.hash --> 重新render
    }
}