import { AppConfig } from '../utils/AppConfig';
import { Meta } from '../ui/base/Meta';
import { Template } from '../ui/base/Template';
import { Section } from '../ui/layout/Section';
import { Button } from '@mui/material';
import { useAppContext } from '../stores/Global';

const Packages = () => {
  const { handleOpenModal } = useAppContext();

  return (
    <div className="antialiased text-neutral-900">
      <Meta title={AppConfig.title} description={AppConfig.description} />
      <Template topPad>
        <Section title="Available Packages">
          <div className="flex flex-col gap-6">
            <div>
              <span>
                All packages include{' '}
                <span className="font-semibold">
                  tables, chairs, tablecloths,{' '}
                  <span className="font-normal">and</span> chair covers
                </span>
                .
              </span>
              <table className="table-auto w-full mt-6">
                <thead className="text-left border-b-2 border-neutral-300">
                  <tr>
                    <th>Capacity</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-300">
                  <tr>
                    <td>50 People</td>
                    <td>$2000</td>
                  </tr>
                  <tr>
                    <td>100 People</td>
                    <td>$2500</td>
                  </tr>
                  <tr>
                    <td>150 People</td>
                    <td>$3000</td>
                  </tr>
                  <tr>
                    <td>200 People</td>
                    <td>$3500</td>
                  </tr>
                  <tr>
                    <td>300 People</td>
                    <td>$4000</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <span className="text-sm italic text-neutral-600">
                <span className="font-semibold">Refundable Deposits:</span>{' '}
                There is a{' '}
                <span className="font-semibold">$1500 damage deposit</span> and
                a <span className="font-semibold">$1000 cleaning deposit</span>{' '}
                required with each rental. As long as the venue is found clean,
                with no damages, these fees will be returned back to the renter.
              </span>
              <br />
              <span className="text-sm italic text-neutral-600">
                <span className="font-semibold">Disclaimer:</span> This price
                list is subject to change and is here only for your planning
                purposes. Please contact us for more information and meet with
                us to discuss the important details for you event.
              </span>
            </div>
            <div className="flex justify-center w-full mt-6">
              <Button
                variant="contained"
                className="bg-blue-500 hover:bg-blue-600 ml-1"
                onClick={handleOpenModal}
              >
                Host your special event with us
              </Button>
            </div>
          </div>
        </Section>
      </Template>
    </div>
  );
};
export default Packages;
