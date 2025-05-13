class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.isRecording = false;
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];

    // 입력 오디오 데이터를 출력으로 복사
    for (let channel = 0; channel < input.length; channel++) {
      const inputChannel = input[channel];
      const outputChannel = output[channel];
      for (let i = 0; i < inputChannel.length; i++) {
        outputChannel[i] = inputChannel[i];
      }
    }

    // 계속 처리
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor); 