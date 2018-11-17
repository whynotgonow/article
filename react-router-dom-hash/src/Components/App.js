import React, {Component} from 'react';
import Home from "./Home";
import User from "./User";
import Profile from "./Profile";
import Login from "./Login";
import Protected from './Protected'
//import {BrowserRouter as Router, Route, Link, Switch} from 'react-router-dom'

import {HashRouter as Router, Route, Link, Switch, MenuLink} from '../react-router-dom'


export default class App extends Component {
    render() {
        return (
            <Router>
                <div className="container">
                    <div className="navbar navbar-default">
                        <div className="container-fluid">
                            <div className="navbar-header">
                                <div className="navbar-brand">管理系统</div>
                            </div>
                            <ul className="nav navbar-nav">
                                <MenuLink to="/home">首页</MenuLink>
                                <MenuLink to="/user">用户管理</MenuLink>
                                <MenuLink to="/profile">个人设置</MenuLink>
                                {/*<li><Link to="/home">首页</Link></li>
                                <li><Link to="/user">用户管理</Link></li>
                                <li><Link to="/profile">个人设置</Link></li>*/}
                            </ul>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <Switch>
                                <Route path="/home" component={Home}/>
                                <Route path="/user" component={User}/>
                                {/* <Route path="/profile" component={Profile}/>*/}
                                <Route path="/login" component={Login}/>
                                <Protected path="/profile" component={Profile}/>
                            </Switch>
                        
                        </div>
                    </div>
                
                </div>
            </Router>
        )
    }
}