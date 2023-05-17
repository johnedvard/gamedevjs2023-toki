const vertShader = `
  precision mediump float;

  uniform mat4 uProjectionMatrix;

  attribute vec2 inPosition;
  attribute vec2 inTexCoord;
  attribute vec4 inColor;

  varying vec2 outTexCoord;
  varying vec4 outColor;

  void main(void) {
    gl_Position = uProjectionMatrix * vec4(inPosition, 0.0, 1.0);
    outTexCoord = inTexCoord;
    outColor = inColor;
  }
`;

const fragShader = `
  precision mediump float;

  uniform sampler2D uMainSampler;
  uniform float uTime;
  uniform float uSpeed;
  uniform float uAmplitude;
  uniform float uWaveLength;

  varying vec2 outTexCoord;
  varying vec4 outColor;

  void main(void) {
    float time = uTime * uSpeed;
    vec2 texCoord = outTexCoord;
    float position = texCoord.x * uWaveLength;

    float offset = sin(uTime * uSpeed + position) * uAmplitude;

    vec2 distortedCoord = vec2(texCoord.x, texCoord.y + offset);
    gl_FragColor = texture2D(uMainSampler, distortedCoord);
  }
`;

export class WavyPipeline extends Phaser.Renderer.WebGL.Pipelines.SinglePipeline {
  constructor(game: Phaser.Game) {
    super({
      game,
      fragShader,
      vertShader,
    });
  }

  onBoot(): void {
    Phaser.Renderer.WebGL.Pipelines.SinglePipeline.prototype.onBoot.call(this);

    this.set1f('uTime', 0);
    this.set1f('uSpeed', 5.0);
    this.set1f('uAmplitude', 0);
    this.set1f('uWaveLength', 99);
  }

  onPreRender() {
    this.setTime('time');
    this.set1f('uTime', this.game.loop.time / 1000);
  }
  setWaveLength(value: number) {
    this.set1f('uWaveLength', value);
  }
  setAmplitude(value: number) {
    this.set1f('uAmplitude', value);
  }
}
