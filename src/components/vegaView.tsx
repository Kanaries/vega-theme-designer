import * as vega from 'vega'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as vegalite from 'vega-lite'
import vegaEmbed, { VisualizationSpec, Config, Result } from 'vega-embed'
import React, { useRef, useEffect } from 'react'

interface VegaConfig {
    spec: VisualizationSpec
    renderer: vega.Renderers
    config: Config
}

export default function vegaView (props: VegaConfig): JSX.Element {
    const vegaEl = useRef<HTMLDivElement | null>(null)

    const { spec, renderer, config } = props
    useEffect(() => {
        spec.config = config
        let vegaDestory: Result | null = null
        void (async () => {
            if (vegaEl.current != null) {
                vegaDestory = await vegaEmbed(vegaEl.current, spec, {
                    actions: false,
                    renderer
                })
            }
        })()

        return () => {
            if (vegaDestory != null) {
                vegaDestory.finalize()
            }
        }
    }, [spec, renderer, config])
    return (
        <div ref={vegaEl}></div>
    )
}
