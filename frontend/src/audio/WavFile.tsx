import React from 'react';
import { FileDescriptor, ExperimentOption } from "./Experiment";

interface Props {
  experimentOption: ExperimentOption
  file: FileDescriptor,
  isPlaying: boolean,
  playCallback: (option: ExperimentOption) => void,
  voteCallback: (option: ExperimentOption) => void,
}

interface State {
}

class WavFile extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  public render() {
    const icon = this.props.isPlaying ? 
      <span className="icon">&#128266;</span>
      : <span className="icon">&#128264;</span>;

    const className = this.props.isPlaying ? "wav-file playing" : "wav-file";

    return (
      <div className="experiment-option-container">
        <div className={className} onClick={() => this.props.playCallback(this.props.experimentOption)}>
          {icon}
          <div className="filename">{this.props.file.name}</div>
        </div>
        <button onClick={() => this.props.voteCallback(this.props.experimentOption)}>Vote</button>
      </div>
    )
  }
}

export { WavFile };

