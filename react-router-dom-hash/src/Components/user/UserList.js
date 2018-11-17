import React, {Component} from 'react';
import Link from "../../react-router-dom/Link";

export default class UserList extends Component {
    constructor() {
        super();
        this.state = {
            users: []
        };
    }
    
    componentDidMount() {
        let users = localStorage.getItem('users');
        users = users ? JSON.parse(users) : [];
        this.setState({
            users
        });
    }
    
    render() {
        return (
            <ul className="list-group">
                {
                    this.state.users.map((user, index) => (
                        <li key={index} className="list-group-item">
                            <Link to={'/user/detail/' + user.id}>{user.username}</Link>
                        </li>
                    ))
                }
            </ul>
        )
    }
    
    
}