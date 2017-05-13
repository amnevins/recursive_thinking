import React, { Component } from 'react';
import {
    withRouter,
    Link
} from 'react-router-dom';
import Routes from './Routes';
import './App.css';
import RouteNavItem from './components/RouteNavItem';
import {
    Nav,
    NavItem,
    Navbar
} from 'react-bootstrap';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import config from './config.js';
import AWS from 'aws-sdk';

class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            userToken: null,
            userInfo: null,
            isLoadingUserToken: true,
        };
    }

    async componentDidMount() {
        const currentUser = this.getCurrentUser();

        if (currentUser === null) {
            this.setState({isLoadingUserToken: false});
            return;
        }

        try {
            const userToken = await this.getUserToken(currentUser);
            this.updateUserToken(userToken);
        }
        catch(e) {
            alert(e);
        }
        try {
            const userInfo = await this.getUserInfo(currentUser);
            this.updateUserInfo(userInfo);

        }
        catch(e) {
            console.log(e, 'getting info')
        }

        this.setState({isLoadingUserToken: false});
    }

    getCurrentUser() {
        const userPool = new CognitoUserPool({
            UserPoolId: config.cognito.USER_POOL_ID,
            ClientId: config.cognito.APP_CLIENT_ID
        });
        return userPool.getCurrentUser();
    }

    getUserToken(currentUser) {
        return new Promise((resolve, reject) => {
            currentUser.getSession(function(err, session) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(session.getIdToken().getJwtToken());
            });
        });
    }

    getUserInfo(currentUser) {
        return new Promise((resolve, reject) => {
        currentUser.getSession(function(err, session) {
            if (err) {
                alert(err);
                return;
            }
            console.log('session validity: ' + session.isValid());

            // NOTE: getSession must be called to authenticate user before calling getUserAttributes
            currentUser.getUserAttributes(function(err, attributes) {
                if (err) {
                    console.log(err);
                    // Handle error
                } else {
                    const atts = {};
                    atts.userId = attributes[0].Value;
                    atts.email = attributes[2].Value;
                    resolve(atts);
                }
                    // Do something with attributes
                });
            });
        });
    }

    updateUserToken = (userToken) => {
        this.setState({
            userToken: userToken,
        });
    }

    updateUserInfo = (userInfo) => {
        console.log(userInfo)
        this.setState({
            userInfo: userInfo,
        });
    }

    handleNavLink = (event) => {
        event.preventDefault();
        this.props.history.push(event.currentTarget.getAttribute('href'));
    }

    handleLogout = (event) => {
        const currentUser = this.getCurrentUser();

        if (currentUser !== null) {
            currentUser.signOut();
        }
        if (AWS.config.credentials) {
            AWS.config.credentials.clearCachedId();
        }
        this.updateUserToken(null);

        this.props.history.push('/login');
    }
    render() {
        const childProps = {
            userToken: this.state.userToken,
            userInfo: this.state.userInfo,
            updateUserToken: this.updateUserToken,
        };

        return ! this.state.isLoadingUserToken
            &&
            (
                <div className="App container">
                    <Navbar fluid collapseOnSelect>
                        <Navbar.Header>
                            <Navbar.Brand>
                                <Link to="/">Dev Day</Link>
                            </Navbar.Brand>
                            <Navbar.Toggle />
                        </Navbar.Header>
                        <Navbar.Collapse>
                            <Nav pullRight>
                                { this.state.userToken
                                    ? <NavItem onClick={this.handleLogout}>Logout</NavItem>
                                    : [ <RouteNavItem key={1} onClick={this.handleNavLink} href="/signup">Signup</RouteNavItem>,
                                    <RouteNavItem key={2} onClick={this.handleNavLink} href="/login">Login</RouteNavItem> ] }
                            </Nav>
                        </Navbar.Collapse>
                    </Navbar>
                    <Routes childProps={childProps} />
                </div>
            );
    }
}
export default withRouter(App);
