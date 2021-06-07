<% include $newserver$\V2Libaray\HL7V2Support.js %>
<% include $newserver$\PASFhir\HL7Table.js %>
<% include $newserver$\PASFhir\HL7V2ToFhirMapping.js %>
<% include $newserver$\PASFhir\HL7MessageHeader.js %>
<% include $newserver$\PASFhir\Patient.js %>
<% include $newserver$\PASFhir\Encounter.js %>
<% include $newserver$\PASFhir\Address.js %>
<% include $newserver$\PASFhir\Contact.js %>
<% include $newserver$\PASFhir\Merge.js %>

  function BusinessModel() {

    this.FacilityConfig = null;
    this.Logger = null;
    this.MessageHeader = null;
    this.Patient = null;
    this.Encounter = null;
    this.Doctor = null;
    this.Merge = null;
    this.IsPatientMerge = false;

    this.CanProcessADTMessage = function (oHL7) {
      //The current inbound HL7 V2 message type
      var MessageType = oHL7.Segment("MSH", 0).Field(9).Component(1).AsString.toUpperCase();
      //The current inbound HL7 V2 message event
      var MessageEvent = oHL7.Segment("MSH", 0).Field(9).Component(2).AsString.toUpperCase();
      if (MessageType == "ADT") {
        if (MessageEvent == "A01" || MessageEvent == "A08" || MessageEvent == "A03" || MessageEvent == "A02") {
          this.IsPatientMerge = false;
          return { ok: true, errorMessage: "" };
        } else if (MessageEvent == "A40") {
          this.IsPatientMerge = true;
          return { ok: true, errorMessage: "" };
        }
      }
      var Msg = "Unexpected Message Type or Event. Found (" + MessageType + "^" + MessageEvent + ") expect Types (ADT) and Events (A01, A08, A03, A40)";
      //this.Logger.Log(Msg)
      return { ok: false, errorMessage: Msg };
    };

    this.ProcessADTMessage = function (oHL7) {
      if (!this.IsPatientMerge) {
        this.MessageHeader = new HL7MessageHeader(oHL7.Segment("MSH", 0));
        this.Patient = new Patient(oHL7.Segment("PID", 0), this.FacilityConfig);
        this.Encounter = new Encounter(oHL7, this.FacilityConfig);
      } else {
        this.MessageHeader = new HL7MessageHeader(oHL7.Segment("MSH", 0));
        this.Patient = new Patient(oHL7.Segment("PID", 0), this.FacilityConfig);
        this.Merge = new Merge(this.FacilityConfig);
        this.Merge.MRGSegmentInflate(oHL7.Segment("MRG", 0));
      }
    };

    //==============================================================================
    // Support Classes
    //==============================================================================

    function Doctor(oROL) {
      /** @property {string} Given - The Doctor's given name*/
      this.Given = null;
      /** @property {string} Family - The Doctor's family name*/
      this.Family = null;
      /** @property {Address} Address - The Doctor's address */
      this.Address = null;
      /** @property {Contact} Contact - The Doctor's home contacts*/
      this.Contact = null;

      this.Given = Set(oROL.Field(4).Component(3));
      this.Family = Set(oROL.Field(4).Component(2));

      //Doctor Address
      //(1: Business, 2: Mailing Address, 3:Temporary Address, 4:Residential/Home, 9: Not Specified)
      //At RMH we had issues in that we got many addresses and could not pick the one required for the current primary doctor surgery
      //This was resolved and the PMI is to now only send a single address that being the correct address.
      //For this reason I have changes the code below to just take the first address regardless of there being many, which there should not be.


      //If we did not get the target adddress then just take the first address.
      if (oROL.Field(11).RepeatCount > 0) {
        this.Address = new Address(oROL.Field(11).Repeats(0));
      }

      //Doctor Contacts (We only take the first of each type.
      this.Contact = new Contact();
      this.Contact.Inflate(oROL.Field(12), PhoneUseEnum.Work);
    }

    //------------------------------------------------------------------------------
    // Private Methods, tools, enums
    //------------------------------------------------------------------------------

    // Function to find the correct HL7 V2 Role (ROL) segment for the Patient's General Practitioner information
    function ResolveGeneralPractitionerROL(oHL7) {
      for (var i = 0; (i < oHL7.CountSegment("ROL")); i++) {
        //ToDo: Check with Gita about codes in ROL-9.1, which codes to look for and can we get many of the same type
        // for the target we want GP?
        //Also what to do if we get not GP ROL segment
        //ROL-3.1 (Provider Role) = AP: Authoring Provider, CP:Consulting Doctor, RT:Discharged to/Referring provider, RP:Discharging/Referring provider, IR:Intended Recipient, PP:Primary Provider General Practitioner)
        //ROL-9.1= GMPRC: General Practitioner
        var ProviderRole = "PP";
        var ProviderType = "GMPRC";
        if (oHL7.Segment("ROL", i).Field(3).Component(1).AsString.toUpperCase() == ProviderRole &&
          oHL7.Segment("ROL", i).Field(9).Component(1).AsString.toUpperCase() == ProviderType) {
          return oHL7.Segment("ROL", i);
        }
      }
      return null;
    }

    //We want the HL7 Nulls |""| within the Business module because we later apply logic to them for ICIMS
    function Set(Content) {
      if (Content.IsNull)
        return "\"\"";
      else if (Content.AsString != "")
        return Content.AsString;
      else
        return null;
    }

  }