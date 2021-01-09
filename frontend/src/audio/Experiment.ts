
export class FileDescriptor {

  name: string;
  relative_path: string;

  constructor(name: string, relative_path: string) {
    this.name = name;
    this.relative_path = relative_path;
  }

  static fromJson(json: any) : FileDescriptor {
    return new FileDescriptor(json.name, json.relative_path);
  }
  
  getWavUrl() : string {
    return `http://localhost:5000/wav/${this.relative_path}`
  }
}

export class Experiment {

  file_a: FileDescriptor;
  file_b: FileDescriptor;

  constructor(file_a: FileDescriptor, file_b: FileDescriptor) {
    this.file_a = file_a;
    this.file_b = file_b;
  }

  static fromJson(json: any) : Experiment {
    const fd_a = FileDescriptor.fromJson(json.file_a);
    const fd_b = FileDescriptor.fromJson(json.file_b);
    return new Experiment(fd_a, fd_b);
  }
}

export enum ExperimentOption {
  A,
  B,
}
