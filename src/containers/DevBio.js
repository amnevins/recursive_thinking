import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import {
    FormGroup,
    FormControl,
    ControlLabel,
} from 'react-bootstrap';
import LoaderButton from '../components/LoaderButton';
import config from '../config.js';
import './DevBio.css';
import { invokeApig, s3Upload, getUserId } from '../libs/awsLib';

class DevBio extends Component {
    constructor(props) {
        super(props);

        this.file = null;
        this.picture = null;

        this.state = {
            userId: null,
            isLoading: null,
            bio: '',
            name: '',
            linkedin: '',
            github: '',
            website: '',
            occupation: '',
            technologies: '',
        };
    }

    async componentDidMount() {
        if (!this.props.userToken) {
            return;
        }

        this.setState({ isLoading: true });

        try {
            const results = await this.devs();
            const userId = await getUserId(this.props.userToken);
            this.setState({ devs: results, userId: userId });
        }
        catch(e) {
            console.log('uh oh home get broke');

        }

        this.setState({ isLoading: false });
    }

    validateForm() {
        return this.state.bio.length > 0;
    }

    handleChange = (event) => {
        this.setState({
            [event.target.id]: event.target.value
        });
    }

    handleFileChange = (event) => {
        this.file = event.target.files[0];
    }

    handlePictureChange = (event) => {
        this.picture = event.target.files[0];
    }

    handleSubmit = async (event) => {
        event.preventDefault();

        if (this.file && this.file.size > config.MAX_ATTACHMENT_SIZE) {
            alert('Please pick a file smaller than 5MB');
            return;
        }

        if (this.picture && this.picture.size > config.MAX_ATTACHMENT_SIZE) {
            alert('Please pick a file smaller than 5MB');
            return;
        }

        this.setState({ isLoading: true });

        try {
            const uploadedFilename = (this.file)
                ? await s3Upload(this.file, this.props.userToken)
                : null;

            const uploadedPicture = (this.file)
                ? await s3Upload(this.file, this.props.userToken)
                : null;

            await this.createDev({
                userId: this.state.userId,
                bio: this.state.bio,
                name: this.state.name,
                linkedin: this.state.linkedin,
                github: this.state.github,
                website: this.state.website,
                occupation: this.state.occupation,
                technologies: this.state.technologies,
                resume: uploadedFilename,
                picture: uploadedPicture,
            });
            this.props.history.push('/');
        }
        catch(e) {
            alert(e);
            this.setState({ isLoading: false });
        }

    }

    createDev(dev) {
        return invokeApig({
            path: '/devs',
            method: 'POST',
            body: dev,
        }, this.props.userToken);
    }

    render() {
        return (
            <div className="DevBio">
                <form onSubmit={this.handleSubmit}>
                    <FormGroup controlId="name">
                        <ControlLabel>Name</ControlLabel>
                        <FormControl
                            onChange={this.handleChange}
                            value={this.state.name}
                            componentClass="input" />
                    </FormGroup>
                    <FormGroup controlId="occupation">
                        <ControlLabel>Occupation</ControlLabel>
                        <FormControl
                            onChange={this.handleChange}
                            value={this.state.occupation}
                            componentClass="input" />
                    </FormGroup>
                    <FormGroup controlId="website">
                        <ControlLabel>Website</ControlLabel>
                        <FormControl
                            onChange={this.handleChange}
                            value={this.state.website}
                            componentClass="input" />
                    </FormGroup>
                    <FormGroup controlId="linkedin">
                        <ControlLabel>Linked In</ControlLabel>
                        <FormControl
                            onChange={this.handleChange}
                            value={this.state.linkedin}
                            componentClass="input" />
                    </FormGroup>
                    <FormGroup controlId="github">
                        <ControlLabel>Github</ControlLabel>
                        <FormControl
                            onChange={this.handleChange}
                            value={this.state.github}
                            componentClass="input" />
                    </FormGroup>
                    <FormGroup controlId="technologies">
                        <ControlLabel>Technologies</ControlLabel>
                        <FormControl
                            onChange={this.handleChange}
                            value={this.state.technologies}
                            componentClass="input" />
                    </FormGroup>
                    <FormGroup controlId="bio">
                        <ControlLabel>Bio</ControlLabel>
                        <FormControl
                            onChange={this.handleChange}
                            value={this.state.bio}
                            componentClass="textarea" />
                    </FormGroup>
                    <FormGroup controlId="file">
                        <ControlLabel>Resume</ControlLabel>
                        <FormControl
                            onChange={this.handleFileChange}
                            type="file" />
                    </FormGroup>
                    <FormGroup controlId="picture">
                        <ControlLabel>Picture</ControlLabel>
                        <FormControl
                            onChange={this.handlePictureChange}
                            type="file" />
                    </FormGroup>
                    <LoaderButton
                        block
                        bsStyle="primary"
                        bsSize="large"
                        disabled={ ! this.validateForm() }
                        type="submit"
                        isLoading={this.state.isLoading}
                        text="Create Profile"
                        loadingText="Creating…" />
                </form>
            </div>
        );
    }
}

export default withRouter(DevBio);
