/** Original, quiet ambient score synthesized locally. No third-party music or downloads. */
const AMBIENT_GAIN = 0.22

export class AmbientAudio {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private reverb: ConvolverNode | null = null
  private timer: ReturnType<typeof setInterval> | null = null
  private nextChord = 0
  private chordIndex = 0
  private enabled = false
  private playbackRevision = 0

  async start(onStarted?: () => void) {
    const revision = ++this.playbackRevision
    if (!this.context) {
      const context = new AudioContext()
      this.context = context
      this.master = context.createGain()
      this.master.gain.value = 0
      this.master.connect(context.destination)
      this.reverb = context.createConvolver()
      const impulse = context.createBuffer(2, context.sampleRate * 3, context.sampleRate)
      for (let channel = 0; channel < 2; channel++) {
        const samples = impulse.getChannelData(channel)
        for (let i = 0; i < samples.length; i++)
          samples[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / samples.length, 3) * 0.35
      }
      this.reverb.buffer = impulse
      const wet = context.createGain()
      wet.gain.value = 0.3
      this.reverb.connect(wet).connect(this.master)
      this.nextChord = context.currentTime + 0.1
    }
    const context = this.context
    // Autoplay may stay suspended until a gesture. Never leave the UI waiting on it.
    let timeout: ReturnType<typeof setTimeout> | undefined
    const resume = context.resume().then(() => {
      if (
        this.context !== context ||
        context.state !== 'running' ||
        revision !== this.playbackRevision
      )
        return false
      this.enabled = true
      this.updateGain()
      this.schedule()
      if (!this.timer) this.timer = setInterval(() => this.schedule(), 1000)
      onStarted?.()
      return true
    })
    try {
      return await Promise.race([
        resume,
        new Promise<boolean>((resolve) => {
          timeout = setTimeout(() => resolve(false), 400)
        }),
      ])
    } finally {
      clearTimeout(timeout)
    }
  }

  private schedule() {
    const context = this.context
    if (!context || !this.master || !this.reverb || !this.enabled || context.state !== 'running')
      return
    // Slow Dmaj9 → Bm7 → Gmaj9 → Asus2 progression, no percussion or abrupt transitions.
    const chords = [
      [50, 57, 61, 66, 69],
      [47, 54, 57, 62, 66],
      [43, 54, 57, 62, 66],
      [45, 52, 57, 59, 64],
    ]
    if (this.nextChord < context.currentTime) this.nextChord = context.currentTime + 0.1
    while (this.nextChord < context.currentTime + 5) {
      const chord = chords[this.chordIndex++ % chords.length]
      chord.forEach((note, index) => {
        const start = this.nextChord + index * 0.13
        const oscillator = context.createOscillator()
        const filter = context.createBiquadFilter()
        const envelope = context.createGain()
        const pan = context.createStereoPanner()
        oscillator.type = index < 2 ? 'sine' : 'triangle'
        oscillator.frequency.value = 440 * Math.pow(2, (note - 69) / 12)
        oscillator.detune.value = index % 2 ? 3 : -3
        filter.type = 'lowpass'
        filter.frequency.value = 850
        filter.Q.value = 0.3
        pan.pan.value = (index - 2) * 0.15
        envelope.gain.setValueAtTime(0, start)
        envelope.gain.linearRampToValueAtTime(index === 0 ? 0.15 : 0.085, start + 3)
        envelope.gain.setValueAtTime(index === 0 ? 0.15 : 0.085, start + 7)
        envelope.gain.linearRampToValueAtTime(0, start + 13)
        oscillator.connect(filter).connect(envelope).connect(pan)
        pan.connect(this.master!)
        pan.connect(this.reverb!)
        oscillator.start(start)
        oscillator.stop(start + 13.1)
        oscillator.onended = () => {
          oscillator.disconnect()
          filter.disconnect()
          envelope.disconnect()
          pan.disconnect()
        }
      })
      this.nextChord += 11
    }
  }

  private updateGain() {
    if (this.context && this.master) {
      this.master.gain.cancelScheduledValues(this.context.currentTime)
      this.master.gain.setTargetAtTime(
        this.enabled ? AMBIENT_GAIN : 0,
        this.context.currentTime,
        0.5,
      )
    }
  }
  mute() {
    this.playbackRevision++
    this.enabled = false
    this.updateGain()
    if (this.timer) clearInterval(this.timer)
    this.timer = null
  }
  async hide() {
    if (this.context?.state === 'running') await this.context.suspend()
  }
  async show() {
    if (this.enabled && this.context?.state === 'suspended') await this.context.resume()
  }
  dispose() {
    this.playbackRevision++
    this.enabled = false
    if (this.timer) clearInterval(this.timer)
    this.timer = null
    const context = this.context
    const master = this.master
    this.context = null
    this.master = null
    this.reverb = null
    if (context && master) {
      master.gain.cancelScheduledValues(context.currentTime)
      master.gain.setTargetAtTime(0, context.currentTime, 0.12)
      setTimeout(() => {
        void context.close().catch(() => {})
      }, 450)
    }
  }
}
