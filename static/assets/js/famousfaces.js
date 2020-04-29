import React, { Component } from 'react';
import '../../../assets/famousfaces.css'
import Webcam from './react-webcam';
import { Button } from 'semantic-ui-react'
import { Grid, Image, Loader, Dimmer} from 'semantic-ui-react'

var DetectRTC = require('detectrtc');

var faces_api_url="https://facesapi.nukapi.com/";
if (process.env.REACT_APP_FACESAPIURL){
    faces_api_url=process.env.REACT_APP_FACESAPIURL
}

class FamousFaces extends Component {
    constructor(props) {
        super(props);
        this.capture = this.capture.bind(this);
        this.retry = this.retry.bind(this)
        this.fetchCelebs = this.fetchCelebs.bind(this);
        this.handleFetchCelebs = this.handleFetchCelebs.bind(this);
        this.state = {
            face_id: this.props.face_id,
            nearest_celebrities: this.props.nearest_celebrities,
            screenshot: this.props.screenshot,
            waiting: false,
            file: [],
            hascamera: false,
            webcampermission: false
        }
    }

    setRef = (webcam) => {
        this.webcam = webcam;
    }

    fetchCelebs() {
        const encodedValue = encodeURIComponent(this.state.face_id);
        var facesapi_url = faces_api_url + 'face?face_id=' + encodedValue;
        fetch(facesapi_url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        })
            .then(response => this.handleFetchCelebs(response))
    };

    handleFetchCelebs(response) {
        if (response['status'] === 200) {
            response.json().then(data => this.setState({nearest_celebrities: data, waiting: false}))
        }
        else if (response['status'] === 404) {
            setTimeout(this.fetchCelebs, 1500);
        }
    }

    capture() {
        var screenshot = this.webcam.getScreenshot()
        this.setState({ screenshot: screenshot } );
        fetch(faces_api_url + 'face', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'image': screenshot.replace(/^data:image\/[a-z]+;base64,/, "")
            })
        })
            .then(response => response.json())
            .then(data => this.setState({ face_id: data['face_id'], waiting: true }))
            .then(() => setTimeout(this.fetchCelebs, 1000))
    };

    retry() {
        this.setState({screenshot: undefined, waiting: false, nearest_celebrities: undefined});
    };

    render() {
        var images = [];
        var key_idx = 0;
        if (this.state.nearest_celebrities) {
            for (var current_celeb in this.state.nearest_celebrities) {
                var current_imgs = this.state.nearest_celebrities[current_celeb];
                for (var j=0; j<current_imgs.length; j++){
                    key_idx = key_idx + 1;
                    images.push(<Image src={current_imgs[j]} key={key_idx}/>);
                }

            }
        }
        var main =  <div>
            <Webcam
                audio={false}
                height={350}
                ref={this.setRef}
                screenshotFormat="image/jpeg"
                width={350}
            />
            <Button size="massive" fluid={true} positive={true}
                    onClick={this.capture}>Capture photo</Button>
        </div>
        var checkCamera =  function (state, setState) {
            return function() {
                if (state.webcampermission !== DetectRTC.isWebsiteHasWebcamPermissions ||
                    state.hascamera !== DetectRTC.hasWebcam){
                    setState({webcampermission: DetectRTC.isWebsiteHasWebcamPermissions,
                        hascamera: DetectRTC.hasWebcam})}
            }
        }

        const setState = this.setState.bind(this)
        DetectRTC.load(checkCamera(this.state, setState));
        var error_msg = undefined
        if (! this.state.hascamera) {
            error_msg = <h1>famousfaces needs a webcam!Please retry on a smartphone or computer with a webcam.</h1>
        }
        if (! this.state.webcampermission) {
            error_msg = <h1>famousfaces needs access to your webcam!
                Please change the permissions and reload the site.</h1>
        }

        if ( this.state.screenshot !== undefined) {
            main = <div><Image src={ this.state.screenshot} />
                <Button size="massive" fluid={true} positive={true}
                        onClick={this.retry}>Retry</Button>
            </div>
        }
        var loader = null;
        if (this.state.waiting){
            loader = <Dimmer active inverted>
                <Loader indeterminate={true} size="big"> Analysing your face ... </Loader>
            </Dimmer>
        }

        return (
            <Grid verticalAlign='middle' centered>
                <Grid.Row>
                    {error_msg}
                    {main}
                    {loader}
                </Grid.Row>
                <Grid.Row>
                    {images}
                </Grid.Row>
            </Grid>
        );
    }
}

const wrapper = document.getElementById("famousfaces_container");
wrapper ? ReactDOM.render(<FamousFaces />, wrapper) : false;
