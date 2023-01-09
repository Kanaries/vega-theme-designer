import * as vega from 'vega';
import * as vegalite from 'vega-lite';
import vegaEmbed, {VisualizationSpec, Config} from 'vega-embed';
import { useRef, useEffect, Ref } from 'react';

interface VegaConfig {
  spec: VisualizationSpec,
  renderer: vega.Renderers,
  config:Config
}

export default function vegaView(props: VegaConfig) {
  const vegaEl = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    let spec = props.spec
    spec.config = props.config
    if(vegaEl) {
      vegaEmbed(vegaEl.current!, props.spec, {
        actions: false,
        renderer: props.renderer
      })
    }
  }, [props.spec, props.renderer, props.config])
  return (
      <div ref={vegaEl}></div>
  )
}
