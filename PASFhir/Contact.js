function Contact() {
  /** @property {array} Phone - Phone number list */
  this.Phone = [];
  /** @property {array} Mobile - Mobile number list */
  this.Mobile = [];
  /** @property {array} Email - Email address list */
  this.Email = [];
  /** @property {array} Fax - Fax number list */
  this.Fax = [];

  this.InflateBasic = function (Element) {
    var oHl7Support = new HL7V2Support();
    if (Element.Component(1).AsString != "") {
      if (Element.Component(1).AsString.substring(0, 2) == "04") {
        this.Mobile.push(oHl7Support.Set(Element.Component(1)));
      }
      else {
        this.Phone.push(oHl7Support.Set(Element.Component(1)));
      }
    }
  }

  this.Inflate = function (Element, UseType) {
    var oHl7Support = new HL7V2Support();
    var oHL7Table = new HL7Table();
    for (var i = 0; i <= ((Element.RepeatCount) - 1); i++) {
      //Primary Phone
      var oXTN = Element.Repeats(i);
      if (oXTN.Component(2).AsString.toUpperCase() == UseType &&
        oXTN.Component(3).AsString.toUpperCase() == oHL7Table.PhoneEquipmentTypeEnum.Telephone) {
        this.Phone.push(oHl7Support.Set(oXTN.Component(1)));
      }
      //Primary Mobile
      if (oXTN.Component(2).AsString.toUpperCase() == UseType &&
        oXTN.Component(3).AsString.toUpperCase() == oHL7Table.PhoneEquipmentTypeEnum.Mobile) {
        this.Mobile.push(oHl7Support.Set(oXTN.Component(1)));
      }
      //Primary Fax
      if (oXTN.Component(2).AsString.toUpperCase() == UseType &&
        oXTN.Component(3).AsString.toUpperCase() == oHL7Table.PhoneEquipmentTypeEnum.FacsimileMachine) {
        this.Fax.push(oHl7Support.Set(oXTN.Component(1)));
      }
      //Primary Email (Correct Version) e.g ^NET^INTERNET^info@westgatemedical.com.au
      if (oXTN.Component(2).AsString.toUpperCase() == oHL7Table.PhoneUseEnum.EmailAddress &&
        oXTN.Component(3).AsString.toUpperCase() == oHL7Table.PhoneEquipmentTypeEnum.Internet) {
        this.Email.push(oHl7Support.Set(oXTN.Component(4)));
      }
      //Primary Email (Incorrect Version on Patients at RMH) e.g angus.millar@iinet.net.au^PRN^NET
      if (oXTN.Component(2).AsString.toUpperCase() == UseType &&
        oXTN.Component(3).AsString.toUpperCase() == oHL7Table.PhoneUseEnum.EmailAddress) {
        this.Email.push(oHl7Support.Set(oXTN.Component(1)));
      }
    }
  }


}