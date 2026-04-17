import MenuIcon from '@mui/icons-material/Menu';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Button, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import Link from 'next/link';
import { useDropdown, useWindowSize } from '../../hooks';
import { useAppContext } from '../../stores/Global';
import { generateWhatsAppUrl } from '../../utils/Constants';
import { Section } from '../layout/Section';
import { Logo } from './Logo';

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

  // Brand green color for consistency
  const brandGreen = '#7c9885';
  const brandGreenDark = '#6b8574';

  return (
    <Section yPadding="py-1">
      <div className="flex flex-wrap justify-between items-center">
        <div className="pt-2">
          <Link href="/">
            <Logo />
          </Link>
        </div>

        <nav>
          {width > 768 ? (
            <ul className="two-columns flex items-center gap-1 font-medium text-xl text-gray-800">
              {links.map((el, i) => (
                <li key={`nav-item-${i}`}>
                  <Button component={Link} href={el.link} className="text-neutral-900">
                    {el.text}
                  </Button>
                </li>
              ))}
              <li className="flex items-center gap-2">
                <Button
                  variant="outlined"
                  className="normal-case"
                  onClick={() => handleOpenModal()}
                >
                  Contact Us
                </Button>
                <Tooltip title="Chat on WhatsApp">
                  <IconButton
                    href={generateWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    sx={{
                      backgroundColor: brandGreen,
                      color: 'white',
                      width: 40,
                      height: 40,
                      '&:hover': {
                        backgroundColor: brandGreenDark,
                      },
                    }}
                  >
                    <WhatsAppIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </li>
            </ul>
          ) : (
            <div className="flex items-center gap-1">
              <Button
                variant="outlined"
                size="small"
                className="normal-case text-sm"
                onClick={() => handleOpenModal()}
              >
                Contact Us
              </Button>
              <Tooltip title="Chat on WhatsApp">
                <IconButton
                  href={generateWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  sx={{
                    backgroundColor: brandGreen,
                    color: 'white',
                    width: 36,
                    height: 36,
                    '&:hover': {
                      backgroundColor: brandGreenDark,
                    },
                  }}
                >
                  <WhatsAppIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Navigation">
                <IconButton
                  onClick={handleClick}
                  size="small"
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
                  <MenuItem
                    component={Link}
                    href={el.link}
                    key={`nav-dropdown-${i}`}
                    className="justify-end pl-10"
                    onClick={handleClose}
                  >
                    {el.text}
                  </MenuItem>
                ))}
                <MenuItem onClick={() => handleOpenModal()} className="text-brand-green pl-10">
                  Contact Form
                </MenuItem>
              </Menu>
            </div>
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
