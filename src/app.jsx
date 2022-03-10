/* eslint-disable prettier/prettier */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/jsx-handler-names */
/* eslint-disable no-unused-vars */
import cockpit from 'cockpit'
import ReactDOM from 'react-dom'
import React from 'react'

import { ModelContext } from './model-context.jsx'

import {  init as initDialogs, NetworkManagerModel } from './interfaces.js'
import { Application } from './iptv.jsx'

import { useObject, useEvent, usePageLocation } from 'hooks'

const _ = cockpit.gettext

const App = () => {
    const model = useObject(() => new NetworkManagerModel(), null, [])
    useEvent(model, 'changed')
    const interfaces = model.list_interfaces()
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