import Head from 'next/head';
import { useRouter } from 'next/router';
import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

export default function Login() {
  const router = useRouter();
  const { id, audience, acsUrl, providerName, relayState } = router.query;

  const [state, setState] = useState({
    username: 'jackson.doe',
    domain: 'immersivelabs.com',
    acsUrl: 'https://jackson-demo.boxyhq.com/api/oauth/saml',
    audience: 'https://saml.boxyhq.com',
    uid: 'mock-10001',
    firstName: 'Jackson',
    lastName: 'Doe',
    teams: '',
    organisationId: ''
  });

  const acsUrlInp = useRef<HTMLInputElement>(null);
  const emailInp = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (acsUrl && emailInp.current) {
      emailInp.current.focus();
      emailInp.current.select();
    } else if (acsUrlInp.current) {
      acsUrlInp.current.focus();
      acsUrlInp.current.select();
    }
  }, [acsUrl]);

  const handleChange = (e: FormEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.currentTarget;

    setState({
      ...state,
      [name]: value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { username, firstName, lastName, domain, uid, teams, organisationId } = state;

    const response = await fetch(`/api/saml/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: `${username}@${domain}`,
        uid,
        firstName,
        lastName,
        id,
        teams,
        organisationId,
        audience: audience || state.audience,
        acsUrl: acsUrl || state.acsUrl,
        providerName,
        relayState,
      }),
    });

    if (response.ok) {
      const newDoc = document.open('text/html', 'replace');

      newDoc.write(await response.text());
      newDoc.close();
    } else {
      document.write('Error in getting SAML response');
    }
  };

  return (
    <>
      <Head>
        <title>Mock SAML Identity Provider - Login</title>
      </Head>
      <div className='flex min-h-full items-center justify-center'>
        <div className='flex w-full max-w-xl flex-col px-3'>
          <div className='space-y-2'>
            <div className='border-2 p-4'>
              <h2 className='mb-5 text-center text-2xl font-bold text-gray-900'>SAML SSO Login</h2>
              <form onSubmit={handleSubmit}>
                <div className='grid grid-cols-2 gap-y-1 gap-x-5'>
                  {!acsUrl ? (
                    <div className='col-span-2'>
                      <div className='form-control'>
                        <label className='label'>
                          <span className='label-text font-bold'>ACS URL</span>
                        </label>
                        <input
                          type='text'
                          className='input input-bordered'
                          name='acsUrl'
                          id='acsUrl'
                          ref={acsUrlInp}
                          autoComplete='off'
                          placeholder='https://jackson-demo.boxyhq.com/api/oauth/saml'
                          value={state.acsUrl}
                          onChange={handleChange}
                        />
                        <label className='label'>
                          <span className='label-text-alt'>This is where we will post the SAML Response</span>
                        </label>
                      </div>
                      <div className='form-control col-span-2'>
                        <label className='label'>
                          <span className='label-text font-bold'>Audience</span>
                        </label>
                        <input
                          type='text'
                          className='input input-bordered'
                          name='audience'
                          id='audience'
                          autoComplete='off'
                          placeholder='https://saml.boxyhq.com'
                          value={state.audience}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  ) : null}
                  <div className='col-span-2'>
                    <div className='form-control'>
                      <label className='label'>
                        <span className='label-text font-bold'>Email</span>
                        <span className='label-text-alt'>urn:mace:dir:attribute-def:email</span>
                      </label>
                      <div className='grid grid-cols-2 gap-y-1 gap-x-5'>
                        <input
                          name='username'
                          id='username'
                          ref={emailInp}
                          autoComplete='off'
                          type='text'
                          value={state.username}
                          onChange={handleChange}
                          className='input input-bordered'
                          title='Please provide a mock email address'
                        />
                        <select
                          name='domain'
                          id='domain'
                          className='select select-bordered'
                          onChange={handleChange}
                          value={state.domain}>
                          <option value='immersivelabs.com'>@immersivelabs.com</option>
                          <option value='immersivelabs.org'>@immersivelabs.org</option>
                        </select>
                      </div>
                      <label className='label'>

                      </label>
                    </div>
                  </div>
                  <div className='col-span-2'>
                    <div className='form-control'>
                      <label className='label'>
                        <span className='label-text font-bold'>First Name</span>
                        <span className='label-text-alt'>urn:mace:dir:attribute-def:first-name</span>
                      </label>
                      <input
                        name='firstName'
                        id='firstName'
                        ref={emailInp}
                        autoComplete='off'
                        type='text'
                        value={state.firstName}
                        onChange={handleChange}
                        className='input input-bordered'
                        title='Please provide a mock first name'
                      />
                    </div>
                  </div>
                  <div className='col-span-2'>
                    <div className='form-control'>
                      <label className='label'>
                        <span className='label-text font-bold'>Last Name</span>
                        <span className='label-text-alt'>urn:mace:dir:attribute-def:last-name</span>
                      </label>
                      <input
                        name='lastName'
                        id='lastName'
                        ref={emailInp}
                        autoComplete='off'
                        type='text'
                        value={state.lastName}
                        onChange={handleChange}
                        className='input input-bordered'
                        title='Please provide a mock last name'
                      />
                    </div>
                  </div>
                  <div className='col-span-2'>
                    <div className='form-control'>
                      <label className='label'>
                        <span className='label-text font-bold'>Uid</span>
                        <span className='label-text-alt'>urn:mace:dir:attribute-def:uid</span>
                      </label>
                      <input
                        name='uid'
                        id='uid'
                        autoComplete='off'
                        type='text'
                        value={state.uid}
                        onChange={handleChange}
                        className='input input-bordered'
                        title='Please provide a mock email address'
                      />
                      <label className='label'>
                        <span className='label-text-alt'>Mandatory. Ex: <i>564255</i> or <i>jackson.doe@immersivelabs.com</i></span>
                      </label>
                    </div>
                  </div>
                  <div className='col-span-2'>
                    <div className='form-control'>
                      <label className='label'>
                        <span className='label-text font-bold'>Teams</span>
                        <span className='label-text-alt'>urn:mace:dir:attribute-def:team-title</span>
                      </label>
                      <input
                        name='teams'
                        id='teams'
                        autoComplete='off'
                        type='text'
                        value={state.teams}
                        onChange={handleChange}
                        className='input input-bordered'
                        title='Please provide a list of teams'
                      />
                    </div>
                    <label className='label'>
                      <span className='label-text-alt'>Optional. Ex: <i>customer_success,sales</i></span>
                    </label>
                  </div>
                  <div className='col-span-2'>
                    <div className='form-control'>
                      <label className='label'>
                        <span className='label-text font-bold'>Organisation ID</span>
                        <span className='label-text-alt'>urn:mace:dir:attribute-def:organisation-id</span>
                      </label>
                      <input
                        name='organisationId'
                        id='organisationId'
                        autoComplete='off'
                        type='text'
                        value={state.organisationId}
                        onChange={handleChange}
                        className='input input-bordered'
                        title='Please provide an organisationId'
                      />
                    </div>
                    <label className='label'>
                      <span className='label-text-alt'>Optional. Ex: <i>immersivelabs</i></span>
                    </label>
                  </div>
                  <button className='btn btn-primary col-span-2 block'>Sign In</button>
                </div>
              </form>
            </div>
            <div className='alert alert-info'>
              <div>
                <span className='text-sm text-white'>
                  This is a simulated login screen, feel free to pick any username but you are restricted to
                  two domains immersivelabs.com and immersivelabs.org. But this should allow you to test all combinations
                  of your authentication and user modelling.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
