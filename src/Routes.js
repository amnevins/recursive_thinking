import React from 'react';
import { Route, Switch } from 'react-router-dom';
import NotFound from './containers/NotFound';
import Home from './containers/Home';
import Login from './containers/Login';
import AppliedRoute from './components/AppliedRoute';
import DevBio from './containers/DevBio';
import Signup from './containers/Signup';
import Bio from './containers/Bio';
import AuthenticatedRoute from './components/AuthenticatedRoute';
import UnauthenticatedRoute from './components/UnauthenticatedRoute';

export default ({ childProps }) => (
    <Switch>
        <AppliedRoute path="/" exact component={Home} props={childProps} />
        <UnauthenticatedRoute path="/login" exact component={Login} props={childProps} />
        <UnauthenticatedRoute path="/signup" exact component={Signup} props={childProps} />
        <AuthenticatedRoute path="/dev/new" exact component={DevBio} props={childProps} />
        <AuthenticatedRoute path="/dev/:id" exact component={Bio} props={childProps} />
        <Route component={NotFound} />
    </Switch>
);
