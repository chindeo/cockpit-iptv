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
    TextArea,
    setTabIndex
    ,Toolbar,  ToolbarToggleGroup, ToolbarItem, SearchInput, ToolbarContent, OptionsMenuItem, OptionsMenuSeparator, OptionsMenuToggle, PageSectionVariants, Switch} from '@patternfly/react-core'
import { SearchIcon, ExclamationCircleIcon, FilterIcon } from '@patternfly/react-icons'
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
import SortAmountDownIcon from '@patternfly/react-icons/dist/esm/icons/sort-amount-down-icon'
import { format } from 'date-fns'
import { ModalError } from 'cockpit-components-inline-notification.jsx'


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
        
        this.state = {
            repo:null,
            alerts: [],
            repositories: [],

            page: 1,
            perPage: 10,
            totalItemCount: 0,

            showActivateTaskModalType: "",
            showActivateTaskModal: false,

            query: "",
            status: -1,
            enable: -1,
        }
        this.onFilter = this.onFilter.bind(this)
        this.onFilterStatus = this.onFilterStatus.bind(this)
        this.onFilterEnable = this.onFilterEnable.bind(this)
        this.onSetPage = this.onSetPage.bind(this)
        this.onPerPageSelect = this.onPerPageSelect.bind(this)
        this.tasklist = this.tasklist.bind(this)
        this.renderPagination = this.renderPagination.bind(this)
        this.addAlert = this.addAlert.bind(this)
        this.openAddTaskDialog = this.openAddTaskDialog.bind(this)
        this.openEditTaskDialog = this.openEditTaskDialog.bind(this)
        this.close = this.close.bind(this)
    }

    onFilter(query, event){
        this.setState({
            query: query
        }, ()=> {
            this.tasklist()
        })
    }

    onFilterStatus(query, event){
        this.setState({
            status: query
        }, ()=> {
            this.tasklist()
        })
    }

    onFilterEnable(query, event){
        this.setState({
            enable: query
        }, ()=> {
            this.tasklist()
        })
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
        }, ()=> {
            this.tasklist()
        })
    }

    onPerPageSelect(_event, perPageNumber) {
        this.setState({
            perPage: perPageNumber
        }, ()=> {
            this.tasklist()
        })
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

    stopAll() {
        if(!this.props.selectedRepoIds || this.props.selectedRepoIds.length ===0){
            return false
        }
        const request = http.post('/api/v1/stream/stopAll',{ids:this.props.selectedRepoIds})
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

    startAll() {
        if(!this.props.selectedRepoIds || this.props.selectedRepoIds.length ===0){
            return false
        }
        const request = http.post('/api/v1/stream/startAll',{ids:this.props.selectedRepoIds})
        request.response((status, headers) => {
            if (status === 200) {
                this.tasklist()
                request.then((data) => {
                    this.addAlert('success', '操作成功')
                })
            } 
        }).catch((data) => {
            this.addAlert('danger', '操作失败', data.message)
        })
    }

    stopTask(id) {
        console.log("停止拉流")
        const request = http.get('/api/v1/stream/stop/' + id)
        request.response((status, headers) => {
            console.log(status)
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
        console.log("启动拉流")
        const request = http.get('/api/v1/stream/start/' + id)
        request.response((status, headers) => {
            console.log(status)
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
            limit: this.state.perPage,
            q:this.state.query,
            status:this.state.status,
            enable:this.state.enable
        })
        request.response((status, headers) => {
            if (status === 200) {
                request
                        .then((data) => {
                        // 需要转换json to obj
                            if (data !== '' && data !== null) {
                                const res = JSON.parse(data)
                                console.log(res.rows)
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
                title: '10',
                value: 10
            },
            {
                title: '20',
                value: 20
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
            enable: '是否可用',
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

        const isRepoSelectable = repo => repo.name !== ''
        const selectableRepos = this.state.repositories.filter(isRepoSelectable)
        const selectAllRepos = (isSelecting = true) => this.props.setselectedRepoIds(isSelecting ? selectableRepos.map(r => r.id) : [])
        const areAllReposSelected = this.props.selectedRepoIds.length === selectableRepos.length
        const isRepoSelected = repo => this.props.selectedRepoIds.includes(repo.id)
        const setRepoSelected = (repo, isSelecting = true) => this.props.setselectedRepoIds(prevSelected => {
            const otherSelectedRepoIds = prevSelected.filter(r => r !== repo.id)
            return isSelecting && isRepoSelectable(repo) ? [...otherSelectedRepoIds, repo.id] : otherSelectedRepoIds
        })
        const onSelectRepo = (repo, rowIndex, isSelecting) => {
            if (this.props.shifting && this.props.recentSelectedRowIndex !== null) {
                const numberSelected = rowIndex - this.props.recentSelectedRowIndex
                const intermediateIndexes = numberSelected > 0 ? Array.from(new Array(numberSelected + 1), (_x, i) => i + this.props.recentSelectedRowIndex) : Array.from(new Array(Math.abs(numberSelected) + 1), (_x, i) => i + rowIndex)
                intermediateIndexes.forEach(index => setRepoSelected(this.state.repositories[index], isSelecting))
            } else {
                setRepoSelected(repo, isSelecting)
            }
            this.props.setRecentSelectedRowIndex(rowIndex)
        }



        const getSortableRowValues = repo => {
            const {id} = repo
            return [id]
        }
        let sortedRepositories = this.state.repositories
        if (this.props.activeSortIndex !== null) {
            sortedRepositories = this.state.repositories.sort((a, b) => {
                const aValue = getSortableRowValues(a)[this.props.activeSortIndex]
                const bValue = getSortableRowValues(b)[this.props.activeSortIndex]
                if (typeof aValue === 'number') {
                    if (this.props.activeSortDirection === 'asc') {
                        return aValue - bValue
                    }
                    return bValue - aValue
                } else {
                    if (this.props.activeSortDirection === 'asc') {
                        return aValue.localeCompare(bValue)
                    }
                    return bValue.localeCompare(aValue)
                }
            })
        }
        const getSortParams = columnIndex => ({
            sortBy: {
                index: this.props.activeSortIndex,
                direction: this.props.activeSortDirection
            },
            onSort: (_event, index, direction) => {
                this.props.setActiveSortIndex(index)
                this.props.setActiveSortDirection(direction)
            },
            columnIndex
        })
        const options = [
            { value: '', label: '拉流状态', disabled: false, isPlaceholder: true },
            { value: '0', label: '未启动', disabled: false, isPlaceholder: false },
            { value: '1', label: '已启动', disabled: false, isPlaceholder: false },
        ]
        const enableOptions = [
            { value: '', label: '源状态', disabled: false, isPlaceholder: true },
            { value: '0', label: '不可用', disabled: false, isPlaceholder: false },
            { value: '1', label: '已可用', disabled: false, isPlaceholder: false },
        ]

        return (
            <Page>
                <PageSection variant={PageSectionVariants.light} type="nav" className="services-header ct-pagesection-mobile">
                    <Toolbar 
                    // data-loading={loadingUnits}
                        //  clearAllFilters={onClearAllFilters}
                 className="pf-m-sticky-top ct-compact services-toolbar"
                 id="services-toolbar">
                        <ToolbarContent>
                            <ToolbarToggleGroup toggleIcon={<><span className="pf-c-button__icon pf-m-start"><FilterIcon /></span>{_("Toggle filters")}</>} breakpoint="sm"
                            variant="filter-group" alignment={{ default: 'alignLeft' }}>
                                <ToolbarItem variant="search-filter">
                                    <SearchInput id="services-text-filter"
                             className="services-text-filter"
                             placeholder={_("搜索源名称")}
                             value={this.state.query}
                             onChange={this.onFilter}
                             onClear={() => this.onFilter('')} />
                                </ToolbarItem>
                                <ToolbarItem variant="search-filter">
                                    <FormSelect
                                      value={this.state.status}
                                      onChange={this.onFilterStatus}
                                      aria-label="拉流状态"
                                    >
                                        {options.map((option, index) => (
                                            <FormSelectOption isDisabled={option.disabled} key={index} value={option.value} label={option.label} />
                                        ))}
                                    </FormSelect>
                                </ToolbarItem>
                                <ToolbarItem variant="search-filter">
                                    <FormSelect
                                      value={this.state.enable}
                                      onChange={this.onFilterEnable}
                                      aria-label="源状态"
                                    >
                                        {enableOptions.map((option, index) => (
                                            <FormSelectOption isDisabled={option.disabled} key={index} value={option.value} label={option.label} />
                                        ))}
                                    </FormSelect>
                                </ToolbarItem>
                            </ToolbarToggleGroup>
                        </ToolbarContent>
                    </Toolbar>
                    
                    <AlertGroup isLiveRegion>{this.state.alerts}</AlertGroup>
                    <Card >
                        <CardTitle>
                            <Split>
                                <SplitItem isFilled>IPTV数据服务</SplitItem>
                                <SplitItem>
                                    <Button variant='primary' onClick={this.openAddTaskDialog}>
                                        添 加
                                    </Button>{' '}
                                    <Button variant='warning' onClick={this.startAll.bind(this)}>
                                        启 动
                                    </Button>{' '}
                                    <Button variant='danger' onClick={this.stopAll.bind(this)}>
                                        停 止
                                    </Button>
                                </SplitItem>
                            </Split>
                        </CardTitle>
                        <CardBody>
                            <TableComposable aria-label='Actions table'>
                                <Thead>
                                    <Tr>
                                        <Th select={{
                                            onSelect: (_event, isSelecting) => selectAllRepos(isSelecting),
                                            isSelected: areAllReposSelected
                                        }} />
                                        <Th sort={getSortParams(0)} width={2}>{columnNames.id}</Th>
                                        <Th width={5}>{columnNames.name}</Th>
                                        <Th width={5}>{columnNames.roomName}</Th>
                                        <Th width={20}>{columnNames.source}</Th>
                                        <Th width={15}>{columnNames.url}</Th>
                                        <Th>{columnNames.transType}</Th>
                                        <Th>{columnNames.status}</Th>
                                        <Th>{columnNames.enable}</Th>
                                        <Th>{columnNames.startAt}</Th>
                                        <Td />
                                        <Td />
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {sortedRepositories.map((repo,rowIndex) => {
                                        const rowActions = defaultActions(repo)
                                        return (
                                            <Tr key={repo.roomName}>
                                                <Td select={{
                                                    rowIndex,
                                                    onSelect: (_event, isSelecting) => onSelectRepo(repo, rowIndex, isSelecting),
                                                    isSelected: isRepoSelected(repo),
                                                    disable: !isRepoSelectable(repo)
                                                }} />
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
                                                <Td textCenter dataLabel={columnNames.enable}>
                                                    <Label
                                                      color={
                                                          repo.enable
                                                              ? 'green'
                                                              : ''
                                                      }
                                                    >
                                                        {repo.enable ? '已可用':'不可用'}
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
                            <ActivateZoneModal http={http} type={this.state.showActivateTaskModalType} interfaces={this.props.interfaces} repo={this.state.repo}  addAlert={this.addAlert} tasklist={this.tasklist} close={this.close} />
                        )}
                    </Card>
                </PageSection>
            </Page>
        )
    }
}


class ActivateZoneModal extends React.Component {
    constructor(props) {
        super(props)
        if(props.type === "add"){
            this.state = {
                id: {validated:"default",value:0},
                name: {validated:"default",value:""},
                source:  {validated:"default",value:""},
                roomName:  {validated:"default",value:""},
                transType:  {validated:"default",value:"HLS"},
                enable:  {validated:"default",value:false},
                debug:  {validated:"default",value:false},

                parentChoices: props.interfaces,

                dialogError: null,
                dialogErrorDetail: null,
                title:"添加任务",
                invalidText: '不能为空',
                validated: 'default',
            }
        }else if(props.type === "edit"){
            this.state = {
                id: {validated:"default",value:props.repo.id},
                name: {validated:"default",value:props.repo.name},
                source:  {validated:"default",value:props.repo.source},
                roomName:  {validated:"default",value:props.repo.roomName},
                transType:  {validated:"default",value:props.repo.transType},
                enable:  {validated:"default",value:props.repo.enable},
                debug:  {validated:"default",value:props.repo.debug},
                parentChoices: props.interfaces,

                dialogError: null,
                dialogErrorDetail: null,
                title:"编辑任务",
                invalidText: '不能为空',
                validated: 'default',
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
        this.setState({ [key]: {value:value,validated :"default"} })
    }

    save(event) {
        const data = {
            id: this.state.id.value,
            name: this.state.name.value,
            source: this.state.source.value,
            roomName: this.state.roomName.value,
            transType: this.state.transType.value,
            // enable: this.state.enable.value,
            debug: this.state.debug.value,
        }
        if(this.props.type === "edit"){
            if(data.id==="" || data.id===undefined){
                this.setState({ id: {validated :"error"},dialogError:"标识数据异常！！" })
                return false
            }
        }
        if(data.name==="" || data.name===undefined){
            this.setState({ name: {validated :"error"},dialogError:"请正确输入任务名称！！" })
            return false
        }
        if(data.source==="" || data.source===undefined){
            this.setState({ source: {validated :"error"},dialogError:"请正确输入推流数据源！！" })
            return false
        }
        if(data.roomName==="" || data.roomName===undefined){
            this.setState({ roomName: {validated :"error"},dialogError:"请正确输入自定义路径！！" })
            return false
        }
        if(data.transType==="" || data.transType===undefined){
            this.setState({ transType: {validated :"error"},dialogError:"请正确选择输出类型！！" })
            return false
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
                request.catch((data) => {
                    console.log(data)
                    this.props.addAlert('danger', '操作失败',  data.message)
                })
                return false
            }
        })
        if (event){          
            event.preventDefault()
        }
        return false
    }

    render() {
        this.options = [
            { value: 'HLS', label: 'HLS', disabled: false },
            { value: 'RTMP', label: 'RTMP', disabled: false },
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
                header={
                    <>
                        {this.state.dialogError && (
                            <ModalError
                                dialogError={this.state.dialogError}
                                dialogErrorDetail={this.state.dialogErrorDetail}
                            />
                        )}
                    </>
                }
                footer={
                    <>
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
                        validated={this.state.source.validated}
                    >
                        <Flex direction={{ default: 'column' }}>
                            <FlexItem className='add-zone-zones-firewalld'>
                                <TextArea
                                    isRequired
                                    type='text'
                                    id='source'
                                    name='source'
                                    aria-describedby='拉流任务数据源地址'
                                    value={this.state.source.value}
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
                        validated={this.state.transType.validated}
                    >
                        <FormSelect isRequired 
                        value={this.state.transType.value} 
                        onChange={(value) => this.onChange('transType', value)} 
                        aria-label="FormSelect Input"
                        >
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
                        validated={this.state.name.validated}
                    >
                        <TextInput
                        isRequired
                        type='text'
                        id='name'
                        name='name'
                        aria-describedby='推流名称'
                        value={this.state.name.value}
                        onChange={(value) => this.onChange('name', value)}
                        />
                    </FormGroup>
                    <FormGroup
                        isRequired
                        label={_('路径')}
                        className='add-zone-zones'
                        helperText={_('推流路径用来生成输出连接和生成m3u8文件存放目录,必须唯一，例如：/cctv1')}
                        helperTextInvalid='请输入正确的推流路径'
                        validated={this.state.roomName.validated}
                    >
                        <TextInput
                        isRequired
                        type='text'
                        id='roomName'
                        name='roomName'
                        aria-describedby='推流路径'
                        value={this.state.roomName.value}
                        onChange={(value) => this.onChange('roomName', value)}
                        />
                    </FormGroup>
                    <FormGroup label={_('调试')} >
                        <Flex direction={{ default: 'column' }}>
                            <FlexItem className='add-zone-zones-custom'>
                                <Switch
                                    id="simple-switch"
                                    label="调试开启"
                                    labelOff="调试关闭"
                                    isChecked={this.state.debug.value}
                                    onChange={(value) => this.onChange('debug', value)}
                                />
                            </FlexItem>
                        </Flex>
                    </FormGroup>
                    
                </Form>
            </Modal>
        )
    }
}
