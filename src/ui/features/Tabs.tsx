import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Section } from '../layout/Section';
import { useRouter } from 'next/router';

interface ITabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface ITabProps {
  tabs: Array<{
    name: string;
    children?: React.ReactNode;
  }>;
  title?: string;
  description?: string;
  withRouter?: boolean;
}

function TabPanel(props: ITabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export function BasicTabs(props: ITabProps) {
  const router = useRouter();
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    if (process.env.NEXT_PUBLIC_DEV) console.log('handleChange', event);
    setValue(newValue);
  };

  React.useEffect(() => {
    if (props.withRouter) {
      const tabNum = router.query.tab ? Number(router.query.tab) : 0;
      setValue(tabNum);
      if (router.asPath.includes('?'))
        router.push({ pathname: '/packages' }, undefined, { shallow: true });
    }
  }, []);

  return (
    <Section title={props.title} description={props.description}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="tabs"
          variant="fullWidth"
        >
          {props.tabs &&
            props.tabs.map((el, i) => (
              <Tab key={`tab-${i}`} label={el.name} {...a11yProps(i)} />
            ))}
        </Tabs>
      </Box>
      {props.tabs &&
        props.tabs.map((el, i) => (
          <TabPanel key={`tab-panel-${i}`} value={value} index={i}>
            {el.children || <></>}
          </TabPanel>
        ))}
    </Section>
  );
}
