import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import {
    FormGroup,
    FormControl,
    ControlLabel,
} from 'react-bootstrap';
import LoaderButton from '../components/LoaderButton';
import config from '../config.js';
import './Bio.css';
import { invokeApig, s3Upload } from '../libs/awsLib';

class Bio extends Component {
    constructor(props) {
        super(props);

        this.file = null;
        this.picture = null;

        this.state = {
            isLoading: null,
            isDeleting: null,
            originalBio: null,
            content: '',
        };
    }

    async componentDidMount() {
        try {
            const results = await this.getBio();
            this.setState({
                originalBio: results,
                dev: results,
                bio: results.bio,
                github: results.github,
                linkedin: results.linkedin,
                website: results.website,
                name: results.name,
                occupation: results.occupation,
                resume: results.resume,
                technologies: results.technologies,
                userId: results.userId,
                picture: results.picture,
            });
        }
        catch(e) {
            alert(e);
        }
    }

    getBio() {
        return invokeApig({ path: `/devs/${this.props.match.params.id}` }, this.props.userToken);
    }

    validateForm() {
        return this.state.bio.length > 0;
    }

    formatFilename(str) {
        return (str.length < 50)
            ? str
            : str.substr(0, 20) + '...' + str.substr(str.length - 20, str.length);
    }

    handleChange = (event) => {
        console.log(event.target.value, event.target.id);
        this.setState({
            [event.target.id]: event.target.value
        });
    };

    handleFileChange = (event) => {
        this.file = event.target.files[0];
    };

    handlePictureChange = (event) => {
        this.picture = event.target.files[0];
    };

    saveDev(dev) {
        return invokeApig({
            path: `/devs/${this.props.match.params.id}`,
            method: 'PUT',
            body: dev,
        }, this.props.userToken);
    }

    handleSubmit = async (event) => {
        let uploadedFilename;
        let uploadedPicture;

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

            if (this.file) {
                uploadedFilename = await s3Upload(this.file, this.props.userToken);
            }

            if (this.picture) {
                uploadedPicture = await s3Upload(this.picture, this.props.userToken);
            }

            const aDev = {
                bio: this.state.bio,
                github: this.state.github,
                linkedin: this.state.linkedin,
                website: this.state.website,
                name: this.state.name,
                occupation: this.state.occupation,
                resume: uploadedFilename ||this.state.resume,
                technologies: this.state.technologies,
                userId: this.state.userId,
                picture: uploadedPicture || this.state.picture,
            }
            await this.saveDev(aDev);
            this.props.history.push('/');
        }
        catch(e) {
            alert(e);
            this.setState({ isLoading: false });
        }
    }

    deleteBio() {
        return invokeApig({
            path: `/devs/${this.props.match.params.id}`,
            method: 'DELETE',
        }, this.props.userToken);
    }

    handleDelete = async (event) => {
        event.preventDefault();

        const confirmed = confirm('Are you sure you want to delete this dev?');

        if ( ! confirmed) {
            return;
        }

        this.setState({ isDeleting: true });

        try {
            await this.deleteBio();
            this.props.history.push('/');
        }
        catch(e) {
            alert(e);
            this.setState({ isDeleting: false });
        }
    }

    render() {
        return (
            <div className="Bio">
                { this.state.originalBio &&
                ( <form onSubmit={this.handleSubmit}>
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
                        text="Save"
                        loadingText="Saving…" />
                    <LoaderButton
                        block
                        bsStyle="danger"
                        bsSize="large"
                        isLoading={this.state.isDeleting}
                        onClick={this.handleDelete}
                        text="Delete"
                        loadingText="Deleting…" />
                </form> )}
            </div>
        );
    }
}

export default withRouter(Bio);
