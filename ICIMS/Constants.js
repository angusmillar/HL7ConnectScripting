function Constants() {

  //Base Urls
  this.baseUrl = {
    icims: {
      resourceProfile: "https://www.icims.com.au/fhir"
    }
  };

  //Organization info
  this.organization = {
    icims: {
      id: "bab13701-776a-41fd-86a9-7aa19df2825d",
      name: "ICIMS",
      aliasList: ["Innovative Clinical Information Management Systems"]
    },
    sah: {
      id: "95f4641f-6de7-470c-a44c-90ef5eb17faf",
      name: "SAH",
      aliasList: ["SAN", "Sydney Adventist Hospital"],
      application: {
        cliniSearch: {
          code: "CliniSearch",
          name: "CliniSearch"
        },
        sanApps: {
          code: "SANAPPS",
          name: "SAN APPS",
          codeSystem: {
            messageControlId: "https://www.sah.org.au/systems/fhir/hl7-v2/message-control-id"
          }
        },
        radiationOncology: {
          code: "RadiationOncology",
          name: "Radiation Oncology",
          codeSystem: {
            messageControlId: "https://www.sah.org.au/systems/fhir/radiationOncology/hl7-v2/message-control-id",
            FillerOrderNumber: "e9472622-07c2-4fd5-9a1a-1aa3573b8937",
            ReportPanel: "https://www.sah.org.au/systems/fhir/radiationOncology/reportPanelCode"
          }
        },
        careZone: {
          code: "CareZone",
          name: "Care Zone"
        },
        epiSoft: {
          code: "EPISOFT",
          name: "Epi SOFT",
          codeSystem: {
            FillerOrderNumber: "70a870ef-2a29-4475-bd1d-1604a7eacbe9"
          }
        },
        sanRad: {
          code: "SANRAD",
          name: "SAN Radiology",
          sendingApplicationCode: "BIZTALK",
          sendingFacilityCode: "SAH",
          codeSystem: {
            FillerOrderNumber: "https://www.sah.org.au/systems/fhir/radiology/agfa/fillerOrderNumber",
            ReportPanel: "https://www.sah.org.au/systems/fhir/radiology/agfa/reportPanelCode",
            messageControlId: "https://www.sah.org.au/systems/fhir/radiology/agfa/hl7-v2/message-control-id"
          }
        },
        sanUSForWomen: {
          code: "SANUSForWomen",
          name: "SAN Ultrasound for Women",
          sendingApplicationCode: "BIZTALK",
          sendingFacilityCode: "ultsound",
          codeSystem: {
            FillerOrderNumber: "https://www.sah.org.au/systems/fhir/ultraSoundForWomen/karisma/fillerOrderNumber",
            ReportPanel: "https://www.sah.org.au/systems/fhir/ultraSoundForWomen/karisma/reportPanelCode",
            messageControlId: "https://www.sah.org.au/systems/fhir/ultraSoundForWomen/karisma/hl7-v2/message-control-id",
            provider: "https://www.sah.org.au/systems/fhir/ultraSoundForWomen/karisma/providerIdentifier"
          }
        }
      }
    },
    dhm: {
      id: "dfc54194-06d4-4fb4-afad-773a8cd4175b",
      name: "DHM",
      aliasList: ["DHM", "Douglass Hanly Moir", "Sonic Pathology"],
      application: {
        apollo: {
          code: "APOLLO",
          name: "Apollo"
        }
      },
      codeSystem: {
        FillerOrderNumber: "http://www.dhm.com.au/fhir/pathology/fillerOrderNumber",
        ReportPanel: "http://www.dhm.com.au/fhir/pathology/reportPanelCode",
        messageControlId: "http://www.dhm.com.au/fhir/pathology/hl7-v2/message-control-id"
      }
    },
    servicesAustralia: {
      codeSystem: {
        medicareProviderNumber: "http://ns.electronichealth.net.au/id/medicare-provider-number"
      }
    }
  };


  //Fhir Resource Profiles urls
  this.fhirResourceProfile = {
    icims: {
      messageBundle: this.baseUrl.icims.resourceProfile + "/StructureDefinition/icims-message-bundle",
      messageHeader: this.baseUrl.icims.resourceProfile + "/StructureDefinition/icims-messageHeader",
      diagnosticReport: this.baseUrl.icims.resourceProfile + "/StructureDefinition/icims-diagnosticReport",
      patient: this.baseUrl.icims.resourceProfile + "/StructureDefinition/icims-patient",
      observation: this.baseUrl.icims.resourceProfile + "/StructureDefinition/icims-observation",
      organization: this.baseUrl.icims.resourceProfile + "/StructureDefinition/icims-organization",
      provenance: this.baseUrl.icims.resourceProfile + "/StructureDefinition/icims-provenance",
      procedureRequest: this.baseUrl.icims.resourceProfile + "/StructureDefinition/icims-procedureRequest",
      Practitioner: this.baseUrl.icims.resourceProfile + "/StructureDefinition/icims-practitioner"
    }
  };



}