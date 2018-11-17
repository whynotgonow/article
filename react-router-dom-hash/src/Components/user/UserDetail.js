import React, {Component} from 'react';

export default class UserDetail extends Component {
    constructor() {
        super();
        this.state = {
            user: {}
        }
    }
    
    componentDidMount() {
        console.log(this.props.match);
        let users = localStorage.getItem('users');
        users = users ? JSON.parse(users) : [];
        let user = users.find((item) => {
            return item.id == this.props.match.params.id;
        });
        this.setState({user});
    }
    
    render() {
        let {user} = this.state;
        return (
            <p className="text-success">
                {user.id}: {user.username}
            </p>
        )
    }
}