import Image from 'next/image'
import React from 'react'
import loginpage from '../../../public/images/loginpage.png'
import registerpage from '../../../public/images/registerpage.png'
import registrationpage from '../../../public/images/vide-registration.png'
import monitoringpage from '../../../public/images/vide-monitoring.png'
import libprep from '../../../public/images/vide-libprep.png'
import dataFilling from '../../../public/images/data-filling.png'
import runsetup from '../../../public/images/vide-runsetup.png'
import reportpage from '../../../public/images/vide-reportpage.png'

const Help = () => {
  return (
    <div className="p-6 mx-auto max-w-7xl">
      <h1 className="text-2xl font-bold mb-4 text-orange-500">About VIDE</h1>
      <p>VIDE is the secure web-based workflow management system designed to track and manage diagnostic samples. It streamlines and organizes the entire management of a sample — from registration to final report generation — ensuring traceability, accountability, and accuracy at every step.</p>
      <p className='my-2'>The application facilitates a structured and role-based workflow through the following key stages:</p>
      <ol className="list-decimal list-inside space-y-2 mt-4">
        <li><strong>Sample Registration:</strong>Registration of the sample received in the Organization.</li>
        <li><strong>Library Preparation & Pooling:</strong>Documenting and managing the sample type (DNA, RNA, EDTA Blood, etc.) library preparation steps and assigning samples to specific pools based on compatibility and project needs.</li>
        <li><strong>Run Setup:</strong>Scheduling and configuring sequencing runs for each pool.</li>
        <li><strong>Reporting:</strong>Uploading and distributing results and reports to clients.</li>
      </ol>
      <p className='my-2'>The Dashboard ensures secure data handling, centralized access to reports, real-time updates, and compliance with diagnostic laboratory workflows. It supports both Admin and Normal roles with specific permissions tailored for operational efficiency.</p>
      <h1 className="text-2xl font-bold mb-4 mt-6 text-orange-500">Login/Registration Instructions</h1>
      <ul className="list-disc list-inside space-y-2">
        <li>Open the link in any supported Browser.</li>
        <li>Login with the valid Username and Password.</li>
        <Image src={loginpage} width={500} height={500} alt='login page' className='mx-auto' />
        <li>If not have Username and Password, Request the Admin:
          <ol className="list-decimal list-inside space-y-2 mt-4 px-6">
            <li>Enter your Name, Organization Name, Email, Phone Number.</li>
            <li>Submit the Form, you will get the Username and Password on the Email.</li>
            <Image src={registerpage} width={500} height={500} alt='register page' className='mx-auto' />
          </ol>
        </li>
        <li>Submit the details, then you will be redirected to the Dashboard.</li>
      </ul>
      <h1 className="text-2xl font-bold mb-4 mt-6 text-orange-500">Roles in VIDE</h1>
      <p className='my-2'>VIDE supports two primary user roles, each with specific permissions and responsibilities:</p>
      <ul className="list-disc list-inside space-y-2">
        <li><strong>Normal Role: </strong>In this role, the Physician can register the sample, see the sample details, prepare the library, and setup the run.</li>
        <li><strong>Admin Role: </strong>In this role, the Physician can do everything like the Normal User, but major difference is, Admin can <b>Edit</b> the samples and <b>Upload the Reports</b>.</li>
      </ul>
      <p className='my-2'>The roles can be assigned by the Neom Scientific Solutions Pvt. Ltd. Only.</p>
      <h1 className="text-2xl font-bold mb-4 mt-6 text-orange-500">Using the VIDE</h1>
      <ul className='list-none space-y-2'>
        <li><strong>Step 1 (Sample Registration): </strong>Register the Sample by filling in the proper details of the patient in the <strong>Sample Registration Tab</strong>.</li>
        <Image src={registrationpage} width={500} height={500} alt='registration page' className='mx-auto my-2' />
        <li><strong>Step 2 (Monitoring): </strong>After registration of the sample successfully, you can see all the details of the sample in the <strong>Processing Tab</strong>, by entering either one of the following:
          <ol className="list-decimal list-inside space-y-2 mt-4 px-6">
            <li>Sample ID</li>
            <li>Test Name</li>
            <li>Sample Status</li>
            <li>Sample Indicator (DNA Isolation, Library Preparation, Under Sequencing, Sequencing Completed)</li>
            <li>From Date and To Date (Finds All the samples registered between the From date to To Date)</li>
            <li>Doctor's Name</li>
            <li>Department Name</li>
            <li>Run ID</li>
          </ol>
          <p>Then click the Retrieve button to get the details.</p>
          <Image src={monitoringpage} width={500} height={500} alt='monitoring page' className='mx-auto my-2' />
          <ul className="list-disc list-inside space-y-2">
            <li>Check the details of the Samples, if you want to edit the sample details click the <strong>Edit</strong> button (Shown at the end of the Row).</li>
            <li>Tick marks the checkboxes if the appropriate step is completed. Like if the DNA Isolation is completed tick the checkbox.</li>
            <li>If the sample is completed with sequencing it’s color is changed to the grey.</li>
            <li>If the sample is repeated at some step it’s color is changed to the dark grey.</li>
            <li>Send the samples for the Library Preparation, by checking the Library Preparation checkbox for the appropriate samples. Click the <strong>Send for Library Preparation</strong> button to send them in the <strong>Library Preparation Tab</strong>.</li>
          </ul>
        </li>
        <li><strong>Step 3 (Library Preparation): </strong>
          <ul className="list-disc list-inside space-y-2">
            <li>Enter the details of the sample to create the pool and library of the sample with the same <strong>Test Name</strong> in the appropriate test name tabs, like if there are multiple samples of the different test name then their will appear different tabs of the test names (WES, CES, CS, SGS, etc.)</li>
            <Image src={libprep} width={500} height={500} alt='library preparation page' className='mx-auto my-2' />
            <li>Enter the value by single click on the input (appears the grey border).</li>
            <li>Select the multiple inputs, by double click on the input and drag the mouse. If you want to write same values in the selected inputs then write your value in the input box appears at the bottom of the screen , or if you want to paste the value (copied from somewhere) paste them by <strong>CTRL+v</strong>, or want to copy those values then <strong>CTRL+c</strong>, or if you want to remove those values then press <strong>delete</strong> or <strong>backspace</strong>.
              <Image src={dataFilling} width={300} height={100} alt='data filling' className='mx-auto my-2' />
            </li>
            <li>At the end of every sample their is <strong className='text-red-400'>Remove</strong> button which will either Repeat the sample or remove it from the Library Preparation tab</li>
            <li>By click the checkbox before the serial number, it will appear <strong>Create Pool</strong> button. It will create a pool of selected samples</li>
            <li>After creation of the pool click the checkbox , it will appear <strong>Create Batch</strong> button. It will create batch of selected pools</li>
            <li>Click the <strong className='text-green-400'>Save</strong> button to save only the samples of the Test tab.</li>
            <li>By clicking the <strong className='text-red-400'>Remove</strong> button all the details of the Library Preparation will removed, either saved or not</li>
          </ul>
        </li>
        <li><strong>Step 4 (Run Setup): </strong>
          <ul className="list-disc list-inside space-y-2">
            <li>After saving the Data in the <strong>Library Preparation Tab</strong>, the saved Tests (Applications) will be appeared in the <strong>Run Setup Tab</strong>, under Application Dropdown input.</li>
            <li>The selected test(s) will be shown in the table format below the applications input.</li>
            <li>Select the <strong>Instrument Type</strong> according to the <strong>Total Data Required</strong>. There are two types of instruments:
              <ul className="list-disc list-inside space-y-2">
                <li>NextSeq 500</li>
                <li>NextSeq 1000/2000</li>
              </ul>
            </li>
            <li>Fill the appropriate details for the selected Instrument Type and press the <strong>Submit</strong> button to save the Run Setup.</li>
            <li>The saved Runs will be shown at the bottom of the page.</li>
            <Image src={runsetup} width={500} height={500} alt='run setup page' className='mx-auto my-2' />
          </ul>
        </li>
        <li><strong>Step 5 (Report Generation & Uploading): </strong> Normal User can only see the details of the samples in the reporting tab, only Admin User can Upload the Reports for the specific sample using the Upload input. Their are inputs specific for the reporting, like: {`Q30 >=`}, Raw Data Generation,etc.
        <Image src={reportpage} width={500} height={500} alt='report page' className='mx-auto my-2' />
        </li>
      </ul>
    </div>
  )
}

export default Help