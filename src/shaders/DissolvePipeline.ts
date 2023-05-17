const fragShader = `
  precision mediump float;

  uniform sampler2D uMainSampler;
  uniform float uTime;

  varying vec2 outTexCoord;

  float noise(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main() {
      vec2 st = outTexCoord;
      vec4 color = texture2D(uMainSampler, st);

      // Calculate dissolve effect based on time and texture coordinates
      float dissolve = 1.0 + (noise(st + uTime) * 0.5) - uTime;

      // Apply dissolve effect to the fragment color
      color.a *= smoothstep(0.0, 0.1, dissolve);
      color.rgb *= color.a;

      gl_FragColor = color;
  }
`;

export class DissolvePipeline extends Phaser.Renderer.WebGL.Pipelines.SinglePipeline {
  constructor(game: Phaser.Game) {
    super({
      game,
      fragShader,
    });
  }

  onBoot(): void {
    Phaser.Renderer.WebGL.Pipelines.SinglePipeline.prototype.onBoot.call(this);

    this.set1f('uTime', 0);
  }

  onPreRender() {
    this.setTime('time');
    this.set1f('uTime', this.game.loop.time / 5000);
  }
}
