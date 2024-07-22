// Copyright (c) 2024, Nelson Mpanju and contributors
// For license information, please see license.txt

frappe.ui.form.on('Clearing File', {
    onload: function(frm) {
        frm.trigger('mode_of_transport');
    },
    refresh: function(frm) {
        if (!frm.custom_buttons['Create Customs Clearance']) {
            frm.add_custom_button(__('Create Customs Clearance'), function() {
                // Code to create Customs Clearance
                frappe.call({
                    method: "frappe.client.insert",
                    args: {
                        doc: {
                            doctype: "Customs Clearance",
                            clearing_file_number: frm.doc.name,
                            customer: frm.doc.customer,
                            clearing_agent: frm.doc.clearing_agent,
                            status: "Payment Pending"
                        }
                    },
                    callback: function(r) {
                        if (!r.exc) {
                            frappe.msgprint(__('Customs Clearance created successfully'));
                            // Optionally, redirect to the new document
                            frappe.set_route('Form', 'Customs Clearance', r.message.name);
                        }
                    }
                });
            }, 'Create');
        }

        if (!frm.custom_buttons['Create Sales Order']) {
            frm.add_custom_button(__('Create Sales Order'), function() {
                // Code to create Sales Order
                frappe.msgprint('Creating Sales Order...');
                // Add your custom logic here for creating Sales Order
            }, 'Create');
        }
    },
customer: function(frm) {
    if (frm.doc.customer) {
        frappe.call({
            method: "av_freight.av_freight.doctype.clearing_file.clearing_file.get_address_display_from_link",
            args: {
                "doctype": "Customer",
                "name": frm.doc.customer
            },
            callback: function(r) {
                if (r.message) {
                    frm.set_value('address_display', r.message.address_display);
                    frm.set_value('customer_address', r.message.customer_address);
                } else {
                    frm.set_value('address_display', '');
                    frm.set_value('customer_address', '');
                }
            }
        });
    } else {
        frm.set_value('address_display', '');
        frm.set_value('customer_address', '');
    }
},
shipper: function(frm){
    if (frm.doc.shipper){
        frappe.call({
            method: "av_freight.av_freight.doctype.clearing_file.clearing_file.get_address_display_from_link",
            args: {
                "doctype": "Shipper",
                "name": frm.doc.shipper
            },
            callback: function(r) {
                if (r.message) {
                    frm.set_value('shipper_address', r.message.address_display);
                    frm.set_value('shipper_address_display', r.message.customer_address);
                } else {
                    frm.set_value('shipper_address_display', '');
                    frm.set_value('shipper_address', '');
                }
            }

        })
    }
},
// customer_address: function(frm) {
//     if (frm.doc.address_display) {
//         // Assuming that address_display is manually filled in, set customer_address to address_display
//         frm.set_value('address_display', frm.doc.address_display);
//     }
// },

// shipper_address_display: function(frm) {
//     if (frm.doc.shipper_address_display) {
//         // Assuming that shipper_address_display is manually filled in, set shipper_address to shipper_address_display
//         frm.set_value('shipper_address', frm.doc.shipper_address_display);
//     }
// },
mode_of_transport: function(frm) {
        frm.trigger('toggle_fields_based_on_transport');
    },
    toggle_fields_based_on_transport: function(frm) {
        if (frm.doc.mode_of_transport == 'Sea') {
            
            frm.toggle_display('carrier_name', true);
            frm.toggle_display('voyage_flight_number', true);
            frm.toggle_display('bill_of_lading_number', true);
            
            
            // Hide fields related to Air transport
            frm.toggle_display('airline', false);
            frm.toggle_display('airplane', false);
            frm.toggle_display("air_waybill",false)
            
        } else if (frm.doc.mode_of_transport == 'Air') { 
            frm.toggle_display('carrier_name', false);
            frm.toggle_display('voyage_flight_number', false); 
            frm.toggle_display('bill_of_lading_number', false);
           
            
            // Show fields related to Air transport
            frm.toggle_display('airline', true);
            frm.toggle_display('airplane', true);
            frm.toggle_display("air_waybill",true);

        } else if (frm.doc.mode_of_transport == 'Land') {
        
            
            // Hide all fields if mode of transport is not selected
            frm.toggle_display('carrier_name', false);
            frm.toggle_display('voyage_flight_number', false);
            frm.toggle_display('bill_of_lading_number', false);
            frm.toggle_display('airline', false);
            frm.toggle_display('airplane', false);
            frm.toggle_display("air_waybill",false)
        }
        frm.set_value('carrier_name', '');
        frm.set_value('voyage_flight_number', '');
    }
});

frappe.ui.form.on('Cargo', {
    package_type: function(frm, cdt, cdn) {
        var row = locals[cdt][cdn];
        var container_number_df = frappe.meta.get_docfield('Cargo', 'container_number', frm.doc.name);
        var seal_number_df = frappe.meta.get_docfield('Cargo', 'seal_number', frm.doc.name);

        if (row.package_type == 'Loose') {
            frappe.model.set_value(cdt, cdn, 'container_number', '');
            frappe.model.set_value(cdt, cdn, 'seal_number', '');
            container_number_df.hidden = 1;
            seal_number_df.hidden = 1;
        } else {
            container_number_df.hidden = 0;
            seal_number_df.hidden = 0;
        }
        
        frm.fields_dict.cargo_details.grid.toggle_display('container_number', !container_number_df.hidden);
        frm.fields_dict.cargo_details.grid.toggle_display('seal_number', !seal_number_df.hidden);
        
        frm.fields_dict.cargo_details.grid.refresh();
    }
});
