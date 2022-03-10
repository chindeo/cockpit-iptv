/* eslint-disable prettier/prettier */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/jsx-handler-names */
/* eslint-disable no-unused-vars */
import cockpit from 'cockpit'
import React from 'react'
import {
    Button,
    DropdownToggle,
    Card,
    CardBody,
    CardTitle,
    CardFooter,
    Page,
    PageSection,
    Pagination,
    Split,
    SplitItem,
    Label,
    Alert,
    AlertGroup,
    Flex,
    FlexItem,
    Form,
    FormGroup,
    Modal,
    TextInput,
    ClipboardCopy,
    ClipboardCopyVariant,
    FormSelect,
    FormSelectOption,
    TextArea
} from '@patternfly/react-core'
import {
    TableComposable,
    TableText,
    Thead,
    Tr,
    Th,
    Tbody,
    Td,
    ActionsColumn
} from '@patternfly/react-table'
import { format } from 'date-fns'
import { ModalError } from 'cockpit-components-inline-notification.jsx'
import { device_state_text, is_managed, render_active_connection } from './interfaces.js'

const _ = cockpit.gettext

const http = cockpit.http({
    address: 'localhost',
    port: 10008
    // headers: {
    //     Authorization: "Basic dXNlcjpwYXNzd29yZA=="
    // },
    // tls: {}
})

export class Application extends React.Component {
    constructor(props) {
        super(props)

        const managed = []
        const unmanaged = []
        const plot_ifaces = []

        props.interfaces.forEach((iface) => {
            function hasGroup(iface) {
                return (
                    (iface.Device &&
                    iface.Device.ActiveConnection &&
                    iface.Device.ActiveConnection.Group &&
                    iface.Device.ActiveConnection.Group.Members.length > 0) ||
                (iface.MainConnection && iface.MainConnection.Groups.length > 0)
                )
            }

            // Skip loopback
            if (iface.Device && iface.Device.DeviceType === 'loopback') return

            // Skip members
            if (hasGroup(iface)) return

            const dev = iface.Device
            const show_traffic = dev && (dev.State === 100 || dev.State === 10) && dev.Carrier === true

            plot_ifaces.push(iface.Name)
            // usage_monitor.add(iface.Name)

            const activeConnection = render_active_connection(dev, false, true)
            const row = {
                columns: [
                    {
                        title:
                        !dev || is_managed(dev) ? (
                            <Button
                                variant='link'
                                isInline
                                onClick={() => cockpit.location.go([iface.Name])}
                            >
                                {iface.Name}
                            </Button>
                        ) : (
                            iface.Name
                        )
                    },
                    { title: activeConnection }
                ],
                props: {
                    key: iface.Name,
                    'data-interface': encodeURIComponent(iface.Name),
                    'data-sample-id': show_traffic ? encodeURIComponent(iface.Name) : null,
                    'data-row-id': iface.Name
                }
            }

            if (show_traffic) {
                // const samples = usage_monitor.samples[iface.Name]
                // row.columns.push({
                //     title: samples ? cockpit.format_bits_per_sec(samples[1][0] * 8) : ''
                // })
                // row.columns.push({
                //     title: samples ? cockpit.format_bits_per_sec(samples[0][0] * 8) : ''
                // })
            } else {
                row.columns.push({ title: device_state_text(dev), props: { colSpan: 2 } })
            }

            if (!dev || is_managed(dev)) {
                managed.push(row)
            } else {
                unmanaged.push(row)
            }
        })

        console.log(props.interfaces)
    
        this.state = {
            repo:null,
            alerts: [],
            repositories: [],

            page: 1,
            perPage: 10,
            totalItemCount: 10,

            showActivateTaskModalType: "",
            showActivateTaskModal: false
        }
        this.onSetPage = this.onSetPage.bind(this)
        this.onPerPageSelect = this.onPerPageSelect.bind(this)
        this.tasklist = this.tasklist.bind(this)
        this.renderPagination = this.renderPagination.bind(this)
        this.addAlert = this.addAlert.bind(this)
        this.openAddTaskDialog = this.openAddTaskDialog.bind(this)
        this.openEditTaskDialog = this.openEditTaskDialog.bind(this)
        this.close = this.close.bind(this)
    }

    close() {
        this.setState({
            showActivateTaskModalType: "",
            showActivateTaskModal: false
        })
    }

    openAddTaskDialog() {
        this.setState({ showActivateTaskModalType: "add",showActivateTaskModal: true })
    }

    openEditTaskDialog(repo) {
        this.setState({ showActivateTaskModalType: "edit",showActivateTaskModal: true,repo:repo })
    }

    onSetPage(_event, pageNumber) {
        this.setState({
            page: pageNumber
        })
        this.tasklist()
    }

    onPerPageSelect(_event, perPageNumber) {
        this.setState({
            perPage: perPageNumber
        })
        this.tasklist()
    }

    addAlert(type, text, detail) {
        const timeout = 1500
        const inAlert = (
            <Alert variant={type} key={1} title={text} timeout={timeout}>
                {detail && <p>{detail}</p>}
            </Alert>
        )
        this.state.alerts.push(inAlert)
    }

    stopTask(id) {
        const request = http.get('/api/v1/stream/stop/' + id)
        request.response((status, headers) => {
            if (status === 200) {
                this.tasklist()
                request.then((data) => {
                    this.addAlert('success', '操作成功')
                })
            } else {
                request.catch((data) => {
                    this.addAlert('danger', '操作失败',  data.message)
                })
            }
        })
    }

    startTask(id) {
        const request = http.get('/api/v1/stream/start/' + id)
        request.response((status, headers) => {
            if (status === 200) {
                this.tasklist()
                request.then((data) => {
                    this.addAlert('success', '操作成功')
                })
            } else {
                request.catch((data) => {
                    this.addAlert('danger', '操作失败', data.message)
                })
            }
        })
    }

    delTask(id) {
        const request = http.get('/api/v1/stream/del/' + id)
        request.response((status, headers) => {
            if (status === 200) {
                this.tasklist()
                request.then((data) => {
                    this.addAlert('success', '操作成功')
                })
            } else {
                request.catch((data) => {
                    this.addAlert('danger', '操作失败',  data.message)
                })
            }
        })
    }

    tasklist() {
        const request = http.get('/api/v1/pushers', {
            start: this.state.page,
            limit: this.state.perPage
        })
        request.response((status, headers) => {
            if (status === 200) {
                request
                        .then((data) => {
                        // 需要转换json to obj
                            if (data !== '' && data !== null) {
                                const res = JSON.parse(data)
                                this.setState({
                                    repositories: res.rows,
                                    totalItemCount: res.total
                                })
                            }
                        })
                        .catch((exception) => {
                            console.log(exception)
                        })
            }
        })
    }

    componentDidMount() {
        this.tasklist()
    }

    renderPagination() {
        const defaultPerPageOptions = [
            {
                title: '1',
                value: 1
            },
            {
                title: '5',
                value: 5
            },
            {
                title: '10',
                value: 10
            }
        ]

        return (
            <Pagination
                itemCount={this.state.totalItemCount}
                page={this.state.page}
                perPage={this.state.perPage}
                perPageOptions={defaultPerPageOptions}
                onSetPage={this.onSetPage}
                onPerPageSelect={this.onPerPageSelect}
                variant='top'
                isCompact
            />
        )
    }

    render() {
        const columnNames = {
            id: 'ID',
            name: '名称',
            roomName: '路径',
            source: '数据源',
            startAt: '启动时间',
            status: '任务状态',
            transType: '输出类型',
            url: '输出地址'
        }

        const customActionsToggle = (props) => (
            <DropdownToggle onToggle={props.onToggle} isDisabled={props.isDisabled}>
                操作
            </DropdownToggle>
        )

        const defaultActions = (repo) => [
            {
                title: '编辑',
                onClick: this.openEditTaskDialog.bind(this,repo)
            },
            {
                title: '删除',
                onClick: this.delTask.bind(this, repo.id)
            },
        ]

        return (
            <>
                <AlertGroup isLiveRegion>{this.state.alerts}</AlertGroup>
                <Card >
                    <CardTitle>
                        <Split>
                            <SplitItem isFilled>IPTV数据服务</SplitItem>
                            <SplitItem>
                                <Button variant='primary' onClick={this.openAddTaskDialog}>
                                    添 加
                                </Button>
                            </SplitItem>
                        </Split>
                    </CardTitle>
                    <CardBody>
                        <TableComposable aria-label='Actions table'>
                            <Thead>
                                <Tr>
                                    <Th width={2}>{columnNames.id}</Th>
                                    <Th width={5}>{columnNames.name}</Th>
                                    <Th width={5}>{columnNames.roomName}</Th>
                                    <Th width={20}>{columnNames.source}</Th>
                                    <Th width={15}>{columnNames.url}</Th>
                                    <Th>{columnNames.transType}</Th>
                                    <Th>{columnNames.status}</Th>
                                    <Th>{columnNames.startAt}</Th>
                                    <Td />
                                    <Td />
                                </Tr>
                            </Thead>
                            <Tbody>
                                {this.state.repositories.map((repo) => {
                                    const rowActions = defaultActions(repo)
                                    return (
                                        <Tr key={repo.roomName}>
                                            <Td dataLabel={columnNames.id}>{repo.id}</Td>
                                            <Td dataLabel={columnNames.name}>
                                                {repo.name}
                                            </Td>
                                            <Td dataLabel={columnNames.roomName}>
                                                {repo.roomName}
                                            </Td>
                                            <Td
                                                  dataLabel={columnNames.source}
                                                  modifier='breakWord'
                                            >
                                                <ClipboardCopy hoverTip="Copy" clickTip="Copied" variant={ClipboardCopyVariant.expansion} >{repo.source}
                                                </ClipboardCopy>
                                            </Td>
                                            <Td
                                                  dataLabel={columnNames.url}
                                                  modifier='breakWord'
                                            >
                                                <ClipboardCopy hoverTip="Copy" clickTip="Copied" variant={ClipboardCopyVariant.expansion} >{repo.url}
                                                </ClipboardCopy>
                                            </Td>
                                            <Td textCenter dataLabel={columnNames.transType}>
                                                {repo.transType}
                                            </Td>
                                            <Td dataLabel={columnNames.status}>
                                                <Label
                                                      color={
                                                          repo.status
                                                              ? 'green'
                                                              : ''
                                                      }
                                                >
                                                    {repo.statusText}
                                                </Label>
                                            </Td>
                                            <Td
                                                  dataLabel={columnNames.startAt}
                                                  modifier='breakWord'
                                            >
                                                {repo.startAt !== '-'
                                                    ? format(
                                                        new Date(repo.startAt),
                                                        'yyyy-MM-dd H:m:s'
                                                    )
                                                    : repo.startAt}
                                            </Td>
                                            <Td
                                                  dataLabel={columnNames.singleAction}
                                                  modifier='fitContent'
                                            >
                                                <TableText>
                                                    {repo.status ? (
                                                        <Button
                                                              variant='danger'
                                                              onClick={this.stopTask.bind(
                                                                  this,
                                                                  repo.id
                                                              )}
                                                        >
                                                            停止
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                              variant='primary'
                                                              onClick={this.startTask.bind(
                                                                  this,
                                                                  repo.id
                                                              )}
                                                        >
                                                            启动
                                                        </Button>
                                                    )}
                                                </TableText>
                                            </Td>
                                            <Td isActionCell>
                                                {rowActions ? (
                                                    <ActionsColumn
                                                          items={rowActions}
                                                          isDisabled={
                                                              repo.status
                                                          }
                                                          actionsToggle={customActionsToggle}
                                                    />
                                                ) : null}
                                            </Td>
                                        </Tr>
                                    )
                                })}
                            </Tbody>
                        </TableComposable>
                    </CardBody>
                    <CardFooter>{this.renderPagination()}</CardFooter>
                    {this.state.showActivateTaskModal && (
                        <ActivateZoneModal http={http} type={this.state.showActivateTaskModalType} repo={this.state.repo}  addAlert={this.addAlert} tasklist={this.tasklist} close={this.close} />
                    )}
                </Card>
            </>
        )
    }
}


class ActivateZoneModal extends React.Component {
    constructor(props) {
        super(props)
        if(props.type === "add"){
            this.state = {
                id: '',
                name: '',
                source: '',
                roomName: '',
                transType: '',
                eth: '',

                interfaces: new Set(),

                dialogError: null,
                dialogErrorDetail: null,
                title:"添加任务"
            }
        }else if(props.type === "edit"){
            this.state = {
                id: props.repo.id,
                name: props.repo.name,
                source:  props.repo.source,
                roomName:  props.repo.roomName,
                transType:  props.repo.transType,
                eth:  props.repo.eth,

                interfaces: new Set(),

                dialogError: null,
                dialogErrorDetail: null,
                title:"编辑任务"
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
            id: this.state.id,
            name: this.state.name,
            source: this.state.source,
            customPath: this.state.customPath,
            roomName: this.state.roomName,
            transType: this.state.transType,
            eth: this.state.eth
        }
        console.log(data)
        const request = http.post('/api/v1/stream/add', data)
        request.response((status, headers) => {
            console.log(status)
            if (status === 200) {
                request.then((data) => {
                    this.props.addAlert('success', '操作成功')
                    this.props.tasklist()
                    this.props.close()
                })
            } else {
                request.catch((data) => {
                    this.props.addAlert('danger', '操作失败',  data.message)
                })
            }
        })
        if (event)
            event.preventDefault()
        return false
    }

    render() {
        this.options = [
            { value: '', label: '请选择', disabled: true },
            { value: 'RTMP', label: 'RTMP', disabled: false },
            { value: 'HLS', label: 'HLS', disabled: false },
            { value: 'FLV', label: 'FLV', disabled: false },
        ]

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
                        <Button
                            variant='primary'
                            onClick={this.save}
                        >
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
                                    //  validated={this.state.tcp_error ? "error" : "default"}
                                    value={this.state.source}
                                    onChange={(value) => this.onChange('source', value)}
                                />
                            </FlexItem>
                        </Flex>
                    </FormGroup>

                    <FormGroup
                        isRequired
                        label={_('推流类型')}
                        className='add-zone-zones'
                        helperText={_('推流类型对应不同的流媒体输出格式')}
                        helperTextInvalid='请选择正确的推流类型'
                    >
                        <FormSelect isRequired value={this.state.transType} onChange={(value) => this.onChange('transType', value)} aria-label="FormSelect Input">
                            {this.options.map((option, index) => (
                                <FormSelectOption isDisabled={option.disabled} key={index} value={option.value} label={option.label} />
                            ))}
                        </FormSelect>
                    </FormGroup>
                    <FormGroup
                        isRequired
                        label={_('名称')}
                        className='add-zone-zones'
                        helperText={_('推流名称')}
                        helperTextInvalid='请输入正确的推流名称'
                    >
                        <TextInput
                                    isRequired
                                    type='text'
                                    id='name'
                                    name='name'
                                    aria-describedby='推流名称'
                                    value={this.state.name}
                                    onChange={(value) => this.onChange('name', value)}
                        />
                    </FormGroup>
                    <FormGroup
                        isRequired
                        label={_('路径')}
                        className='add-zone-zones'
                        helperText={_('推流路径用来生成输出连接和生成m3u8文件存放目录，例如：/cctv1')}
                        helperTextInvalid='请输入正确的推流路径'
                    >
                        <TextInput
                                    isRequired
                                    type='text'
                                    id='roomName'
                                    name='roomName'
                                    aria-describedby='推流路径'
                                    //  validated={this.state.tcp_error ? "error" : "default"}
                                    value={this.state.roomName}
                                    onChange={(value) => this.onChange('roomName', value)}
                        />
                    </FormGroup>
                </Form>
            </Modal>
        )
    }
}
