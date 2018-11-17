import React, {Component} from 'react';
import Route from "./Route";
import Link from './Link'

export default ({to, children}) => {
    // 如果匹配到了，就给当前组件一个激活状态的className
    return <Route path={to} children={props => (
        <li className={props.match ? "active" : ""}>
            <Link to={to}>{children}</Link>
        </li>
    )
    }/>
}