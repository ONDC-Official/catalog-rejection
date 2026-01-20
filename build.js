window.spec = {
  openapi: "3.0.0",
  info: {
    title: "Catalog Status",
    description: "ONDC Network BAPs catalog status API model implementation",
    version: "1.2.0",
  },
  security: [{ SubscriberAuth: [] }],
  paths: {
    "/on_search": {
      post: {
        tags: ["Beckn Application Platform (BAP)"],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  context: { $ref: "#/components/schemas/Context" },
                  message: { type: "object" },
                },
                required: ["context"],
              },
              example: {
                context: {
                  country: "IND",
                  domain: "ONDC:RET10",
                  timestamp: "2023-09-26T23:04:05.254Z",
                  bap_id: "example-test-bap.com",
                  bap_uri: "https://example-test-bap.com/ondc",
                  bpp_id: "example-test-bpp.com",
                  bpp_uri: "https://example-test-bpp.com/ondc",
                  action: "string",
                  transaction_id: "T1",
                  message_id: "M1",
                  city: "std:080",
                  core_version: "1.2.0",
                  ttl: "PT30S",
                },
                message: { catalog: "{ BPP Catalog }" },
              },
            },
          },
        },
        responses: {
          default: {
            description: "Response received",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "object",
                      properties: {
                        ack: { $ref: "#/components/schemas/Ack" },
                        tags: { $ref: "#/components/schemas/TagGroup" },
                      },
                    },
                  },
                  required: ["message"],
                  example: {
                    message: {
                      ack: { status: "ACK" },
                      tags: {
                        code: "CATALOG_PROCESSING",
                        list: [{ code: "MIN_PROCESS_DURATION", value: "PT1H" }],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/catalog_rejection": {
      post: {
        tags: ["Beckn Provider Platform (BPP)"],
        requestBody: {
          description: "Catalog Status Push",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  context: { $ref: "#/components/schemas/Context" },
                },
                oneOf: [
                  {
                    required: ["errors"],
                    properties: {
                      errors: { $ref: "#/components/schemas/Errors" },
                    },
                  },
                  {
                    required: ["message"],
                    properties: {
                      message: {
                        type: "object",
                        required: ["catalog_status"],
                        properties: {
                          catalog_status: {
                            $ref: "#/components/schemas/CatalogStatus",
                          },
                          refs: {
                            type: "array",
                            items: { $ref: "#/components/schemas/Reference" },
                          },
                        },
                      },
                    },
                  },
                ],
                required: ["context"],
              },
              examples: {
                "catalog rejected": {
                  value: {
                    context: {
                      country: "IND",
                      domain: "ONDC:RET10",
                      timestamp: "2023-09-26T23:04:05.254Z",
                      action: "catalog_rejection",
                      bap_id: "example-test-bap.com",
                      bap_uri: "https://example-test-bap.com/ondc",
                      bpp_id: "example-test-bpp.com",
                      bpp_uri: "https://example-test-bpp.com/ondc",
                      transaction_id: "T1",
                      message_id: "M1",
                      city: "std:080",
                      core_version: "1.2.0",
                    },
                    errors: [
                      {
                        type: "BPP-ERROR",
                        code: "9xxx1",
                        path: "message.catalog",
                        message: "item images missing for all the providers",
                      },
                      {
                        type: "PROVIDER-ERROR",
                        code: "90001",
                        path: "message.catalog.bpp/providers[?(@.id=='P1')]",
                        message: "Fulfilment rate below declared standards",
                      },
                      {
                        type: "ITEM-ERROR",
                        code: "91001",
                        path: "message.catalog.bpp/providers[?(@.id=='P1')].items[?(@.id=='I1')]",
                        message: "Item price > MRP",
                      },
                    ],
                  },
                },
                "successfully processed": {
                  value: {
                    context: {
                      country: "IND",
                      domain: "ONDC:RET10",
                      timestamp: "2023-09-26T23:04:05.254Z",
                      action: "catalog_rejection",
                      bap_id: "example-test-bap.com",
                      bap_uri: "https://example-test-bap.com/ondc",
                      bpp_id: "example-test-bpp.com",
                      bpp_uri: "https://example-test-bpp.com/ondc",
                      transaction_id: "T1",
                      message_id: "M1",
                      city: "std:080",
                      core_version: "1.2.0",
                    },
                    message: {
                      catalog_status: {
                        state: { descriptor: { code: "PROCESSED" } },
                      },
                      refs: [
                        {
                          id: "P1",
                          code: "PROVIDER-LINK",
                          path: "message.catalog.bpp/providers[?(@.id=='P1')]",
                          uri: "buyerapp://provider/P1/catalog",
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          default: {
            description: "Response received",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "object",
                      properties: { ack: { $ref: "#/components/schemas/Ack" } },
                    },
                    errors: { $ref: "#/components/schemas/Errors" },
                  },
                  required: ["message"],
                  example: { message: { ack: { status: "ACK" } } },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      SubscriberAuth: {
        type: "apiKey",
        in: "header",
        name: "Authorization",
        description:
          'Signature of message body using BAP or BPP subscriber\'s signing public key. Format: Authorization : Signature keyId="{subscriber_id}|{unique_key_id}|{algorithm}",algorithm="ed25519",created="1606970629",expires="1607030629",headers="(created) (expires) digest",signature="Base64(signing string)"',
      },
    },
    schemas: {
      Ack: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["ACK", "NACK"] },
          tags: {
            type: "array",
            items: { $ref: "#/components/schemas/TagGroup" },
          },
        },
      },
      CatalogStatus: {
        type: "object",
        properties: {
          state: {
            type: "object",
            properties: {
              descriptor: { $ref: "#/components/schemas/Descriptor" },
            },
          },
        },
      },
      Context: {
        type: "object",
        properties: {
          domain: { type: "string" },
          country: { type: "string" },
          city: { type: "string" },
          action: { type: "string" },
          core_version: { type: "string" },
          bap_id: { type: "string" },
          bap_uri: { type: "string" },
          bpp_id: { type: "string" },
          bpp_uri: { type: "string" },
          transaction_id: { type: "string" },
          message_id: { type: "string" },
          timestamp: { type: "string" },
          key: { type: "string" },
          ttl: { type: "string" },
        },
      },
      Descriptor: {
        description: "Physical description of something.",
        type: "object",
        properties: {
          name: { type: "string" },
          code: { type: "string", enum: ["PROCESSED", "REJECTED"] },
          short_desc: { type: "string" },
          long_desc: { type: "string" },
          additional_desc: {
            type: "object",
            properties: {
              url: { type: "string" },
              content_type: {
                type: "string",
                enum: ["text/plain", "text/html", "application/json"],
              },
            },
          },
        },
      },
      Errors: {
        type: "array",
        items: {
          type: "object",
          properties: {
            type: { type: "string" },
            code: { type: "string" },
            path: { type: "string" },
            message: { type: "string" },
          },
        },
      },
      Reference: {
        type: "object",
        required: ["id", "code", "uri"],
        properties: {
          id: {
            type: "string",
            description: "unique id of the reference",
          },
          code: {
            type: "string",
            description: "type of the reference",
            enum: ["PROVIDER-LINK"],
          },
          path: {
            type: "string",
            description: "JSON path",
          },
          uri: {
            type: "string",
            format: "uri",
          },
        },
      },
      Tag: {
        type: "object",
        properties: { code: { type: "string" }, value: { type: "string" } },
      },
      TagGroup: {
        type: "object",
        properties: {
          code: { type: "string" },
          list: { type: "array", items: { $ref: "#/components/schemas/Tag" } },
        },
      },
    },
  },
};
