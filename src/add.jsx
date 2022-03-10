/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable eqeqeq */
/* eslint-disable indent */
/* eslint-disable react/jsx-handler-names */

import {
    Button,
    Flex,
    FlexItem,
    Form,
    FormGroup,
    FormSelect,
    FormSelectOption,
    Modal,
    TextArea,
    TextInput
} from '@patternfly/react-core'
import React from 'react'
import { ModalError } from 'cockpit-components-inline-notification.jsx'
import cockpit from 'cockpit'
const _ = cockpit.gettext

const http = cockpit.http({
    address: 'localhost',
    port: 10008
    // headers: {
    //     Authorization: "Basic dXNlcjpwYXNzd29yZA=="
    // },
    // tls: {}
})

export class ActivateZoneModal extends React.Component {
    constructor(props) {
        super(props)

        console.log(this.props.parentChoices)
        if (this.props.type === 'edit') {
            this.state = {
                title: '编辑任务',
                source: this.props.repo.source,
                eth: this.props.repo.eth,
                customPath: this.props.repo.customPath,
                name: this.props.repo.name,
                roomName: this.props.repo.roomName,
                transType: this.props.repo.transType,

                parentChoices: this.props.parentChoices,
                dialogError: null,
                dialogErrorDetail: null
            }
        } else if (this.props.type === 'add') {
            this.state = {
                title: '添加任务',

                eth: '',
                source: '',
                name: '',
                customPath: '',
                roomName: '',
                transType: '',

                parentChoices: this.props.parentChoices,
                dialogError: null,
                dialogErrorDetail: null
            }
        }

        this.onInterfaceChange = this.onInterfaceChange.bind(this)
        this.onChange = this.onChange.bind(this)
        this.save = this.save.bind(this)
    }

    onInterfaceChange(event) {
        const int = event.target.value
        const enabled = event.target.checked
        this.setState((state) => {
            const interfaces = new Set(state.interfaces)
            if (enabled) interfaces.add(int)
            else interfaces.delete(int)
            return { interfaces: interfaces }
        })
    }

    onChange(key, value) {
        this.setState({ [key]: value })
    }

    save(event) {
        const data = {
            source: this.state.source,
            customPath: this.state.customPath,
            name: this.state.name,
            roomName: this.state.roomName,
            transType: this.state.transType
        }
        if (this.props.type === 'edit') {
            data.id = this.props.repo.id
        }
        const request = http.post('/api/v1/stream/add', data)
        request.response((status, headers) => {
            if (status === 200) {
                request.then((data) => {
                    this.props.addAlert('success', '操作成功')
                    this.props.tasklist()
                    this.props.close()
                })
            } else {
                request.then((data) => {
                    this.props.addAlert('danger', '操作失败', data)
                })
            }
        })

        if (event) event.preventDefault()
        return false
    }

    render() {
        const customTranTypes = [
            { value: '', label: '请选择', disabled: true },
            { value: 'rtmp', label: 'RTMP', disabled: false },
            { value: 'flv', label: 'FLV', disabled: false },
            { value: 'hls', label: 'HLS', disabled: false }
        ]
        // const zones = Object.keys(firewall.zones).filter(z => firewall.zones[z].target === "default" && !firewall.activeZones.has(z));
        // const interfaces = firewall.availableInterfaces.filter(i => {
        //     let inZone = false;
        //     firewall.activeZones.forEach(z => {
        //         inZone |= firewall.zones[z].interfaces.indexOf(i.device) !== -1;
        //     });
        //     return !inZone;
        // });
        // const virtualDevices = interfaces.filter(i => i.capabilities >= 7 && i.device !== "lo").sort((a, b) => a.device.localeCompare(b.device));
        // const physicalDevices = interfaces.filter(i => (i.capabilities < 5 || i.capabilities > 7) && i.device !== "lo").sort((a, b) => a.device.localeCompare(b.device));
        return (
            <Modal
                id='add-zone-dialog'
                isOpen
                position='top'
                variant='medium'
                onClose={this.props.close}
                title={this.state.title}
                footer={
                    <>
                        {this.state.dialogError && (
                            <ModalError
                                dialogError={this.state.dialogError}
                                dialogErrorDetail={this.state.dialogErrorDetail}
                            />
                        )}
                        <Button variant='primary' onClick={this.save}>
                            {_('确认')}
                        </Button>
                        <Button variant='link' className='btn-cancel' onClick={this.props.close}>
                            {_('取消')}
                        </Button>
                    </>
                }
            >
                <Form isHorizontal onSubmit={this.save}>
                    <FormGroup
                        isRequired
                        label={_('数据源')}
                        className='add-zone-zones'
                        helperText={_('拉流任务数据源地址必须是一个有效的rtsp媒体流地址')}
                        helperTextInvalid='请输入正确的拉流任务数据源地址'
                    >
                        <Flex direction={{ default: 'column' }}>
                            <FlexItem className='add-zone-zones-firewalld'>
                                <TextArea
                                    isRequired
                                    type='text'
                                    id='source'
                                    name='source'
                                    aria-describedby='拉流任务数据源地址'
                                    value={this.state.source}
                                    onChange={(value) => this.onChange('source', value)}
                                />
                            </FlexItem>
                        </Flex>
                    </FormGroup>
                    <FormGroup label='名称' isRequired fieldId='name' helperText='仅用于查询标识'>
                        <TextInput
                            isRequired
                            type='text'
                            id='name'
                            name='name'
                            aria-describedby='name-helper'
                            value={this.state.name}
                            onChange={(value) => this.onChange('name', value)}
                        />
                    </FormGroup>
                    <FormGroup
                        label='路径'
                        isRequired
                        fieldId='roomName'
                        helperText='用于生成输出路径唯一标识，同时生成对应M3U8文件存储目录，例如：/cctv1'
                    >
                        <TextInput
                            isRequired
                            type='text'
                            id='roomName'
                            name='roomName'
                            aria-describedby='roomName-helper'
                            value={this.state.roomName}
                            onChange={(value) => this.onChange('roomName', value)}
                        />
                    </FormGroup>

                    <FormGroup label={_('输出类型')} isRequired>
                        <Flex direction={{ default: 'column' }}>
                            <FlexItem className='add-zone-zones-custom'>
                                <FormSelect
                                    isRequired
                                    value={this.state.transType}
                                    onChange={(value, e) => this.onChange('transType', value)}
                                    aria-label='FormSelect Input'
                                >
                                    {customTranTypes.map((option, index) => (
                                        <FormSelectOption
                                            isDisabled={option.disabled}
                                            key={index}
                                            value={option.value}
                                            label={option.label}
                                        />
                                    ))}
                                </FormSelect>
                            </FlexItem>
                        </Flex>
                    </FormGroup>
                    <FormGroup label={_('网口')} isRequired>
                        <Flex direction={{ default: 'column' }}>
                            <FlexItem className='add-zone-zones-custom'>
                                <FormSelect
                                    isRequired
                                    value={this.state.eth}
                                    onChange={(value, e) => this.onChange('eth', value)}
                                    aria-label='FormSelect Input'
                                >
                                    {this.state.parentChoices.map((option, index) => (
                                        <FormSelectOption
                                            isDisabled={option.disabled}
                                            key={index}
                                            value={option.value}
                                            label={option.label}
                                        />
                                    ))}
                                </FormSelect>
                            </FlexItem>
                        </Flex>
                    </FormGroup>
                </Form>
            </Modal>
        )
    }
}
