/* eslint-disable prettier/prettier */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/jsx-handler-names */
/* eslint-disable no-unused-vars */
import cockpit from 'cockpit'
import ReactDOM from 'react-dom'
import React , { useRef }from 'react'
import './lib/patternfly/patternfly-4-cockpit.scss'

import { ModelContext } from './model-context.jsx'

import {  init as initDialogs, NetworkManagerModel , device_state_text, is_managed, render_active_connection } from './interfaces.js'
import { Application } from './iptv.jsx'

import { useObject, useEvent, usePageLocation } from 'hooks'
import { EmptyStatePanel } from 'cockpit-components-empty-state.jsx'
import { UsageMonitor } from './helpers.js'
import { superuser } from 'superuser'
import { PlotState } from 'plot'

const _ = cockpit.gettext

const App = () => {
    const model = useObject(() => new NetworkManagerModel(), null, [])
    useEvent(model, 'changed')

    const nmRunning_ref = useRef(undefined)
    useEvent(model.client, 'owner', (event, owner) => {
        nmRunning_ref.current = owner !== null
    })

    useEvent(superuser, 'changed')


    if (model.curtain === 'testing' || model.curtain === 'restoring') {
        return (
            <EmptyStatePanel
                loading
                title={
                    model.curtain === 'testing' ? _('Testing connection') : _('Restoring connection')
                }
            />
        )
    }

    if (model.ready === undefined) return <EmptyStatePanel loading />

    /* Show EmptyStatePanel when nm is not running */
    if (!nmRunning_ref.current) {
        <EmptyStatePanel
                loading
                title={
                    model.curtain === 'testing' ? _('Testing connection') : _('Restoring connection')
                }
        />
    }

    const interfaces =  model.list_interfaces()

    console.log(interfaces)

    return (
        <ModelContext.Provider value={model}>
            <Application interfaces={interfaces} />
        </ModelContext.Provider>
    )

}

function init() {
    initDialogs()
    ReactDOM.render(<App />, document.getElementById('iptv-page'))
}

document.addEventListener('DOMContentLoaded', init)