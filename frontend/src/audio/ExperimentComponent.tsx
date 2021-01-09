import React from 'react';
import { Howl } from 'howler';
import { Experiment, ExperimentOption } from "./Experiment";
import { WavFile } from "./WavFile";

interface Props {
}

interface State {
  howl?: Howl,
  playState: PlayState,
  experiment?: Experiment,
  count: number,
  autoplay: boolean,
}

enum PlayState {
  None,
  OptionA,
  OptionB,
}

class ExperimentComponent extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      playState: PlayState.None,
      count: 0,
      autoplay: true,
    };
  }

  componentDidMount() {
    this.fetchStats()
      .finally(() => {
        this.fetchNewExperiment();
      });
  }

  fetchStats() : Promise<any> {
    const url = 'http://localhost:5000/stats';

    return fetch(url, {
      method: 'GET',
    })
    .then(res => res.json())
    .then(json => {
      const count = json.trial_count;
      if (count !== undefined) {
        this.setState({
          count: count,
        })
      }
    })
  }

  fetchNewExperiment() {
    if (this.state.howl !== undefined) {
      // Stop playing any old experiment.
      this.state.howl.stop();
      this.setState({
        playState: PlayState.None,
        howl: undefined,
      });
    }

    const url = 'http://localhost:5000/experiment';

    fetch(url, {
      method: 'GET',
    })
    .then(res => res.json())
    .then(json => {
      const experiment = Experiment.fromJson(json);
      this.setState({
        experiment: experiment
      });
      this.incrementCount();
      this.handleAutoplay();
    })
  }

  handleAutoplay() {
    if(!this.state.autoplay) {
      this.stop(); // Removes play state
      return;
    }

    switch (this.state.playState) {
      case PlayState.None:
        this.play(ExperimentOption.A);
        break;
      case PlayState.OptionA:
        this.play(ExperimentOption.B);
        break;
      case PlayState.OptionB:
        this.stop();
        break;
    }
  }

  public play(option: ExperimentOption) {
    if (this.state.howl !== undefined) {
      this.state.howl.stop();
    }

    let file;
    let newPlayState = PlayState.None;

    switch (option) {
      case ExperimentOption.A:
        file = this.state.experiment?.file_a;
        newPlayState = PlayState.OptionA;
        break;
      case ExperimentOption.B:
        file = this.state.experiment?.file_b;
        newPlayState = PlayState.OptionB;
        break;
    }

    let howl;

    if (newPlayState === this.state.playState) {
      // Same file; stop playing.
      newPlayState = PlayState.None;
    } else {
      let url = file!.getWavUrl();
      howl = new Howl({
        src: [url],
        onend: () => {
          this.handleAutoplay();
        }
      });

      howl.play();
    }

    this.setState({ 
      playState: newPlayState,
      howl: howl,
    });
  }

  public vote(option: ExperimentOption) {
    this.stop();

    const url = 'http://localhost:5000/vote';

    let winner;
    let loser;

    switch (option) {
      case ExperimentOption.A:
        winner = this.state.experiment?.file_a.relative_path;
        loser = this.state.experiment?.file_b.relative_path;
        break;
      case ExperimentOption.B:
        winner = this.state.experiment?.file_b.relative_path;
        loser = this.state.experiment?.file_a.relative_path;
        break;
    }

    fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        winner: winner,
        loser: loser,
      }),
    })
    .then(_json => {
      this.fetchNewExperiment();
    })
  }

  public stop() {
    if (this.state.howl !== undefined) {
      this.state.howl.stop();
    }
    this.setState({
      playState: PlayState.None,
      howl: undefined,
    });
  }

  incrementCount() {
    this.setState({
      count: this.state.count + 1
    })
  }

  toggleAutoplay() {
    this.setState({
      autoplay: !this.state.autoplay
    })
  }

  public render() {
    let internalView;
    
    if (this.state.experiment === undefined) {
      internalView = this.renderEmpty();
    } else {
      internalView = this.renderExperiment();
    }

    return (
      <div>
        {internalView}
      </div>
    )
  }

  renderEmpty() {
    return (
      <h1>Loading...</h1>
    );
  }

  renderExperiment() {
    let autoplayToggleLabel = "Turn autoplay ON";
    if (this.state.autoplay) {
       autoplayToggleLabel = "Turn autoplay OFF";
    }

    return (
      <div className="experiment">
        <h1>Trial {this.state.count}</h1>
        <div className="wav-experiment-container">
          {this.renderExperimentOption(ExperimentOption.A)}
          {this.renderExperimentOption(ExperimentOption.B)}
        </div>
        <button onClick={() => this.fetchNewExperiment()}>Skip</button>
        <button onClick={() => this.toggleAutoplay()}>{autoplayToggleLabel}</button>
      </div>
    );
  }

  renderExperimentOption(option: ExperimentOption) {
    let isPlaying = false;
    let file;
    switch (option) {
      case ExperimentOption.A:
        file = this.state.experiment!.file_a;
        isPlaying = this.state.playState === PlayState.OptionA;
        break;
      case ExperimentOption.B:
        file = this.state.experiment!.file_b;
        isPlaying = this.state.playState === PlayState.OptionB;
        break;
    }
    return (
      <WavFile 
        file={file} 
        isPlaying={isPlaying}
        experimentOption={option}
        playCallback={this.play.bind(this)}
        voteCallback={this.vote.bind(this)}
        />
    )
  }
}

export default ExperimentComponent;
