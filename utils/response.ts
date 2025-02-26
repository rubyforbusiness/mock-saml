import crypto from 'crypto';
import xmlbuilder from 'xmlbuilder';
import { User } from '../types';
import saml from '@boxyhq/saml20';

const responseXPath =
  '/*[local-name(.)="Response" and namespace-uri(.)="urn:oasis:names:tc:SAML:2.0:protocol"]';

const randomId = () => {
  return '_' + crypto.randomBytes(10).toString('hex');
};
const createResponseXML = async (params: {
  idpIdentityId: string;
  audience: string;
  acsUrl: string;
  samlReqId: string;
  user: User;
}): Promise<string> => {
  const { idpIdentityId, audience, acsUrl, user, samlReqId } = params;

  const authDate = new Date();
  const authTimestamp = authDate.toISOString();

  authDate.setMinutes(authDate.getMinutes() - 5);
  const notBefore = authDate.toISOString();

  authDate.setMinutes(authDate.getMinutes() + 10);
  const notAfter = authDate.toISOString();

  const inResponseTo = samlReqId;
  // const responseId = crypto.randomBytes(10).toString('hex');

  const teamsAttributeValue = user.teams.map((team_name) => (
    {
      '@xmlns:xs': 'http://www.w3.org/2001/XMLSchema',
      '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      '@xsi:type': 'xs:string',
      '#text': team_name,
    }
  ))

  const attributeStatement = {
    '@xmlns:xs': 'http://www.w3.org/2001/XMLSchema',
    '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    'saml:Attribute': [
      {
        '@Name': 'urn:mace:dir:attribute-def:uid',
        '@NameFormat': 'urn:oasis:names:tc:SAML:2.0:attrname-format:unspecified',
        'saml:AttributeValue': {
          '@xmlns:xs': 'http://www.w3.org/2001/XMLSchema',
          '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          '@xsi:type': 'xs:string',
          '#text': user.uid,
        },
      },
      {
        '@Name': 'urn:mace:dir:attribute-def:email',
        '@NameFormat': 'urn:oasis:names:tc:SAML:2.0:attrname-format:unspecified',
        'saml:AttributeValue': {
          '@xmlns:xs': 'http://www.w3.org/2001/XMLSchema',
          '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          '@xsi:type': 'xs:string',
          '#text': user.email,
        },
      },
      {
        '@Name': 'urn:mace:dir:attribute-def:first-name',
        '@NameFormat': 'urn:oasis:names:tc:SAML:2.0:attrname-format:unspecified',
        'saml:AttributeValue': {
          '@xmlns:xs': 'http://www.w3.org/2001/XMLSchema',
          '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          '@xsi:type': 'xs:string',
          '#text': user.firstName,
        },
      },
      {
        '@Name': 'urn:mace:dir:attribute-def:last-name',
        '@NameFormat': 'urn:oasis:names:tc:SAML:2.0:attrname-format:unspecified',
        'saml:AttributeValue': {
          '@xmlns:xs': 'http://www.w3.org/2001/XMLSchema',
          '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          '@xsi:type': 'xs:string',
          '#text': user.lastName,
        },
      },
      {
        '@Name': 'urn:mace:dir:attribute-def:team-title',
        '@NameFormat': 'urn:oasis:names:tc:SAML:2.0:attrname-format:unspecified',
        'saml:AttributeValue': teamsAttributeValue,
      },
      {
        '@Name': 'urn:mace:dir:attribute-def:organisation-id',
        '@NameFormat': 'urn:oasis:names:tc:SAML:2.0:attrname-format:unspecified',
        'saml:AttributeValue': {
          '@xmlns:xs': 'http://www.w3.org/2001/XMLSchema',
          '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          '@xsi:type': 'xs:string',
          '#text': user.organisationId,
        },
      },
    ],
  };

  const nodes = {
    'samlp:Response': {
      '@xmlns:samlp': 'urn:oasis:names:tc:SAML:2.0:protocol',
      '@Version': '2.0',
      '@ID': randomId(),
      '@Destination': acsUrl,
      '@InResponseTo': inResponseTo,
      '@IssueInstant': authTimestamp,
      'saml:Issuer': {
        '@xmlns:saml': 'urn:oasis:names:tc:SAML:2.0:assertion',
        '@Format': 'urn:oasis:names:tc:SAML:2.0:nameid-format:entity',
        '#text': idpIdentityId,
      },
      'samlp:Status': {
        'samlp:StatusCode': {
          '@Value': 'urn:oasis:names:tc:SAML:2.0:status:Success',
        },
      },
      'saml:Assertion': {
        '@xmlns:saml': 'urn:oasis:names:tc:SAML:2.0:assertion',
        '@Version': '2.0',
        '@ID': randomId(),
        '@IssueInstant': authTimestamp,
        'saml:Issuer': {
          '#text': idpIdentityId,
        },
        'saml:Subject': {
          'saml:NameID': {
            '@Format': 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
            '#text': user.email,
          },
          'saml:SubjectConfirmation': {
            '@Method': 'urn:oasis:names:tc:SAML:2.0:cm:bearer',
            'saml:SubjectConfirmationData': {
              '@InResponseTo': inResponseTo,
              '@NotOnOrAfter': notAfter,
              '@Recipient': acsUrl,
            },
          },
        },
        'saml:Conditions': {
          '@NotBefore': notBefore,
          '@NotOnOrAfter': notAfter,
          'saml:AudienceRestriction': {
            'saml:Audience': {
              '#text': audience,
            },
          },
        },
        'saml:AuthnStatement': {
          '@AuthnInstant': authTimestamp,
          '@SessionIndex': '_YIlFoNFzLMDYxdwf-T_BuimfkGa5qhKg',
          'saml:AuthnContext': {
            'saml:AuthnContextClassRef': {
              '#text': 'urn:oasis:names:tc:SAML:2.0:ac:classes:unspecified',
            },
          },
        },
        'saml:AttributeStatement': attributeStatement,
      },
    },
  };

  return xmlbuilder.create(nodes, { encoding: 'UTF-8' }).end();
};

const signResponseXML = async (xml: string, signingKey: any, publicKey: any): Promise<string> => {
  return await saml.sign(xml, signingKey, publicKey, responseXPath);
};

export { createResponseXML, signResponseXML };
