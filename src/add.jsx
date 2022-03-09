/* eslint-disable react/jsx-no-bind */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable react/jsx-handler-names */

import React from "react";
import cockpit from "cockpit";
import { Button, Checkbox, Flex, FlexItem, Form, FormGroup, FormHelperText, Modal, Radio, TextInput } from "@patternfly/react-core";
// import { ModalError } from "cockpit-components-inline-notification.jsx";

const _ = cockpit.gettext;

export class ActivateZoneModal extends React.Component {
    constructor() {
        super();

        this.state = {
            ipRange: "ip-entire-subnet",
            ipRangeValue: null,
            zone: null,
            interfaces: new Set(),
            dialogError: null,
            dialogErrorDetail: null,
        };
        this.onInterfaceChange = this.onInterfaceChange.bind(this);
        this.onChange = this.onChange.bind(this);
        this.save = this.save.bind(this);
    }

    onInterfaceChange(event) {
        const int = event.target.value;
        const enabled = event.target.checked;
        this.setState(state => {
            const interfaces = new Set(state.interfaces);
            if (enabled)
                interfaces.add(int);
            else
                interfaces.delete(int);
            return { interfaces: interfaces };
        });
    }

    onChange(key, value) {
        this.setState({ [key]: value });
    }

    save(event) {
        // let p;
        // if (firewall.zones[this.state.zone].services.indexOf("cockpit") === -1)
        //     p = firewall.addService(this.state.zone, "cockpit");
        // else
        //     p = Promise.resolve();

        // const sources = this.state.ipRange === "ip-range" ? this.state.ipRangeValue.split(",").map(ip => ip.trim()) : [];
        // p.then(() =>
        //     firewall.activateZone(this.state.zone, [...this.state.interfaces], sources)
        //             .then(() => this.props.close())
        //             .catch(error => {
        //                 this.setState({
        //                     dialogError: _("Failed to add zone"),
        //                     dialogErrorDetail: error.name + ": " + error.message,
        //                 });
        //             }));

        // if (event)
        //     event.preventDefault();
        // return false;
    }

    render() {
        // const zones = Object.keys(firewall.zones).filter(z => firewall.zones[z].target === "default" && !firewall.activeZones.has(z));
        // const customZones = zones.filter(z => firewall.predefinedZones.indexOf(z) === -1);
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
id="add-zone-dialog" isOpen
                   position="top" variant="medium"
                   //  onClose={this.props.close}
                   //  title={_("Add zone")}
                //                    footer={<>
                //                        {
                //                            this.state.dialogError && <ModalError dialogError={this.state.dialogError} dialogErrorDetail={this.state.dialogErrorDetail} />
                //                        }
                //                        <Button
                // variant="primary" onClick={this.save} isDisabled={this.state.zone === null ||
                //                                                                                (this.state.interfaces.size === 0 && this.state.ipRange === "ip-entire-subnet") ||
                //                                                                                (this.state.ipRange === "ip-range" && !this.state.ipRangeValue)}
                //                        >
                //                            { _("Add zone") }
                //                        </Button>
                //                        <Button variant="link" className="btn-cancel" onClick={this.props.close}>
                //                            { _("Cancel") }
                //                        </Button>
                //                            </>}
            >
                <Form
isHorizontal
                // onSubmit={this.save}
                >
                    <FormGroup label={ _("Trust level") } className="add-zone-zones">
                        <Flex>
                            <FlexItem className="add-zone-zones-firewalld">
                                {/* <legend>{ _("Sorted from least to most trusted") }</legend>
                                { zones.filter(z => firewall.predefinedZones.indexOf(z) !== -1).sort((a, b) => firewall.predefinedZones.indexOf(a) - firewall.predefinedZones.indexOf(b))
                                        .map(z =>
                                            <Radio
key={z} id={z} name="zone" value={z}
                                                   isChecked={this.state.zone == z}
                                                   onChange={(value, e) => this.onChange("zone", e.target.value)}
                                                   label={ firewall.zones[z].id }
                                            />
                                        )} */}
                            </FlexItem>
                            <FlexItem className="add-zone-zones-custom">
                                {/* { customZones.length > 0 && <legend>{ _("Custom zones") }</legend> }
                                { customZones.map(z =>
                                    <Radio
key={z} id={z} name="zone" value={z}
                                           isChecked={this.state.zone == z}
                                           onChange={(value, e) => this.onChange("zone", e.target.value)}
                                           label={ firewall.zones[z].id }
                                    />
                                )} */}
                            </FlexItem>
                        </Flex>
                    </FormGroup>

                    <FormGroup label={ _("Description") }>
                        {/* <p id="add-zone-description-readonly">
                            { (this.state.zone && firewall.zones[this.state.zone].description) || _("No description available") }
                        </p> */}
                    </FormGroup>

                    <FormGroup label={ _("Included services") } hasNoPaddingTop>
                        {/* <div id="add-zone-services-readonly">
                            { (this.state.zone && firewall.zones[this.state.zone].services.join(", ")) || _("None") }
                        </div> */}
                        <FormHelperText isHidden={false}>{_("The cockpit service is automatically included")}</FormHelperText>
                    </FormGroup>

                    <FormGroup label={ _("Interfaces") } hasNoPaddingTop isInline>
                        {/* { physicalDevices.map(i =>
                            <Checkbox
key={i.device}
                                      id={i.device}
                                      value={i.device}
                                      onChange={(value, event) => this.onInterfaceChange(event)}
                                      isChecked={this.state.interfaces.has(i.device)}
                                      label={i.device}
                            />) }
                        { virtualDevices.map(i =>
                            <Checkbox
key={i.device}
                                      id={i.device}
                                      value={i.device}
                                      onChange={(value, event) => this.onInterfaceChange(event)}
                                      isChecked={this.state.interfaces.has(i.device)}
                                      label={i.device}
                            />) } */}
                    </FormGroup>

                    <FormGroup label={ _("Allowed addresses") } hasNoPaddingTop isInline>
                        {/* <Radio
name="add-zone-ip"
                               isChecked={this.state.ipRange == "ip-entire-subnet"}
                               value="ip-entire-subnet"
                               id="ip-entire-subnet"
                               onChange={(value, e) => this.onChange("ipRange", e.target.value)}
                               label={ _("Entire subnet") }
                        />
                        <Radio
name="add-zone-ip"
                               isChecked={this.state.ipRange == "ip-range"}
                               value="ip-range"
                               id="ip-range"
                               onChange={(value, e) => this.onChange("ipRange", e.target.value)}
                               label={ _("Range") }
                        /> */}
                        { this.state.ipRange === "ip-range" && <TextInput id="add-zone-ip" onChange={value => this.onChange("ipRangeValue", value)} /> }
                        {/* <FormHelperText isHidden={this.state.ipRange != "ip-range"}>{_("IP address with routing prefix. Separate multiple values with a comma. Example: 192.0.2.0/24, 2001:db8::/32")}</FormHelperText> */}
                    </FormGroup>
                </Form>
            </Modal>
        );
    }
}
