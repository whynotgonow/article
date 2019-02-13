import React, {Component} from 'react';
import {Route, Redirect} from "../react-router-dom";

export default function ({component: Component, ...rest}) {
    return <Route {...rest} render={(props) => (
        localStorage.getItem('login')
            ? <Component {...rest} />
            : <Redirect to={{pathname: '/login', state: {from: props.location.pathname}}}/>
    )
    }/>
}