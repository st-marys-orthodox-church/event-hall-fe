import { Button, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import Link from 'next/link';
import { useWindowSize, useDropdown } from '../../hooks';
import { Section } from '../layout/Section';
import { Logo } from './Logo';
import MenuIcon from '@mui/icons-material/Menu';
import { useAppContext } from '../../stores/Global';

export const Navbar = () => {
  const { handleOpenModal } = useAppContext();
  const { width } = useWindowSize();
  const { open, handleClick, handleClose, anchorEl } = useDropdown();

  const links = [
    {
      text: 'Gallery',
      link: '/gallery',
    },
    {
      text: 'Packages',
      link: '/packages',
    },
  ];
  return (
    <Section yPadding="py-2 md:py-4">
      <div className="flex flex-wrap justify-between items-center">
        <div>
          <Link href="/">
            <a>{<Logo xl />}</a>
          </Link>
        </div>

        <nav>
          {width > 768 ? (
            <ul className="two-columns flex items-center gap-1 font-medium text-xl text-gray-800">
              {links.map((el, i) => (
                <li key={`nav-item-${i}`}>
                  <Link href={el.link}>
                    <Button className="text-neutral-900">{el.text}</Button>
                  </Link>
                </li>
              ))}
              <li>
                <Button
                  variant="contained"
                  className="bg-blue-500 hover:bg-blue-600 ml-1"
                  onClick={handleOpenModal}
                >
                  Contact Us
                </Button>
              </li>
            </ul>
          ) : (
            <>
              <Tooltip title="Navigation">
                <IconButton
                  onClick={handleClick}
                  size="small"
                  sx={{ ml: 2 }}
                  aria-controls={open ? 'navbar-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
                >
                  <MenuIcon fontSize="large" />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                id="navbar-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                {links.map((el, i) => (
                  <Link href={el.link} key={`nav-dropdown-${i}`}>
                    <MenuItem
                      className="justify-end pl-10"
                      onClick={handleClose}
                    >
                      {el.text}
                    </MenuItem>
                  </Link>
                ))}
                <MenuItem
                  onClick={handleOpenModal}
                  className="text-blue-500 pl-10"
                >
                  Contact Us
                </MenuItem>
              </Menu>
            </>
          )}
        </nav>

        <style jsx>
          {`
            .two-columns :global(li:not(:first-child)) {
              @apply mt-0;
            }
          `}
        </style>
      </div>
    </Section>
  );
};
