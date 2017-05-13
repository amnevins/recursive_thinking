import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import {
    PageHeader,
    ListGroup,
    ButtonToolbar,
    Button,
    Thumbnail,
    Panel,
    Col,
} from 'react-bootstrap';
import './Home.css';
import { invokeApig, getUserId } from '../libs/awsLib';

class Home extends Component {

    constructor(props) {

        super(props);
        this.state = {
            userId: '',
            isLoading: false,
            devs: [],
            open: false,
        };
    }

    async componentDidMount() {
        if (!this.props.userToken) {
            console.log('no user')
            return;
        }

        this.setState({ isLoading: true });

        try {
            const results = await this.devs();
            const userId = await getUserId(this.props.userToken).username;
            const devMap = {};
            results.map(dev => devMap[dev.userId] = false);
            this.setState({ devs: results, userId: userId, devMap: devMap });
        }
        catch(e) {
            console.log('uh oh home get broke');
            alert(e);
        }

        this.setState({ isLoading: false });
    }

    websiteClick = (e) => {
        e.preventDefault();
        window.open(`http://${e.target.id}`);
    };

    githubClick = (e) => {
        e.preventDefault();
        window.open(`http://www.github.com/${e.target.id}`)
    };

    linkedinClick = (e) => {
        e.preventDefault();
        window.open(`https://www.linkedin.com/in/${e.target.id}`)
    };

    handleOpen = (e) => {
        e.preventDefault();
        let newDevMap = this.state.devMap;
        newDevMap[e.currentTarget.id] = !newDevMap[e.currentTarget.id];
        this.setState({
            devMap: newDevMap,
        })
    };

    devs() {
        return invokeApig({ path: '/devs' }, this.props.userToken);
    }

    renderCreate(devs) {
        const token = this.state.userId;
        let create = <Thumbnail onClick={this.handleDevClick} href="dev/new" className="devPicture newDev" key="new" src="./neo.jpeg" alt="../public/neo.jpeg">
                        <Button block bsSize="large" >Create a Profile</Button>
                     </Thumbnail>;
        devs.forEach(function(doc) {
            if (doc.email === token) {
                create = '';
            }
        });
        return (
            <div>
                {create !== '' ?
                    <Col xs={12} md={4} lg={3}>
                        <div className="center">
                            {create}
                        </div>
                    </Col>
                : null}
            </div>
        )
    }

    renderDevList(devs) {
        const token = this.state.userId;
        return [{}].concat(devs).map((dev, i) => (
            i !== 0 ?
                <div className="devCard">
                    <Col xs={12} md={4} lg={3}>
                        <Thumbnail onClick={this.handleOpen} id={dev.userId} className="devPicture" key={dev.userId} src={dev.picture} alt="../public/neo.jpeg">
                        <h3>{dev.name}</h3>
                            <p>{dev.occupation}</p>
                            <Panel bsStyle="success" collapsible expanded={this.state.devMap[dev.userId]} >
                                <p className="bioText" >{dev.bio}</p>
                                <ButtonToolbar>
                                    <Button block id={dev.github} onClick={this.githubClick}>Github</Button>
                                    <Button block id={dev.website} onClick={this.websiteClick}>Website</Button>
                                    <Button block id={dev.linkedin} onClick={this.linkedinClick}>LinkedIn</Button>
                                    <Button block ><a href={dev.resume}>Resume</a></Button>
                                </ButtonToolbar>
                            </Panel>
                            {token === dev.email ?
                                <Button
                                    block
                                    key="new"
                                    href={`/dev/${dev.devId}`}
                                    onClick={this.handleDevClick}>
                                    Edit Your Profile
                                </Button> : ''
                            }
                        </Thumbnail>
                    </Col>
                </div>
            : ''

        ));
    }

    handleDevClick = (event) => {
        event.preventDefault();
        this.props.history.push(event.currentTarget.getAttribute('href'));
    }

    renderLander() {
        return (
            <div className="lander">
                <h1>Seattle Dev Day</h1>
                <p>Network. Inspire. Create.</p>
                <div>
                    <Link to="/login" className="btn btn-info btn-lg">Login</Link>
                    <Link to="/signup" className="btn btn-success btn-lg">Signup</Link>
                </div>
            </div>
        );
    }

    renderDevs() {
        return (
            <div className="devs">
                <PageHeader>Seattle Dev Day <small className="pullRight">Meet the Devs</small></PageHeader>
                <ListGroup>
                    { ! this.state.isLoading && this.renderCreate(this.state.devs) }
                    { ! this.state.isLoading && this.renderDevList(this.state.devs) }
                </ListGroup>
            </div>
        );
    }

    render() {
        return (
            <div className="Home">
                { !this.props.userToken
                    ? this.renderLander()
                    : this.renderDevs() }
            </div>
        );
    }
}

export default withRouter(Home);
