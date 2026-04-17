import MenuIcon from '@mui/icons-material/Menu';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
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
    { text: 'Gallery', link: '/gallery' },
    { text: 'Packages', link: '/packages' },
  ];

  return (
    <Section yPadding="py-3">
      <div className="flex justify-between items-center gap-6">
        <Link href="/" className="flex items-center" aria-label="Fellowship Event Hall — Home">
          <Logo />
        </Link>

        <nav>
          {width > 768 ? (
            <ul className="flex items-center gap-8">
              {links.map((el, i) => (
                <li key={`nav-item-${i}`}>
                  <Link
                    href={el.link}
                    className="eyebrow text-stone-700 hover:text-[#7c9885] transition-colors duration-300 ease-refined relative group"
                  >
                    {el.text}
                    <span className="absolute -bottom-1.5 left-0 w-full h-px bg-[#c9a86c] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-refined" />
                  </Link>
                </li>
              ))}
              <li className="flex items-center gap-3 pl-4 border-l border-stone-200">
                <button
                  type="button"
                  onClick={() => handleOpenModal()}
                  className="eyebrow text-stone-700 hover:text-[#7c9885] border border-stone-300 hover:border-[#7c9885] px-4 py-2 transition-colors duration-300 ease-refined"
                >
                  Contact Us
                </button>
                <Tooltip title="Chat on WhatsApp">
                  <IconButton
                    href={generateWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    sx={{
                      borderRadius: 0,
                      color: '#7c9885',
                      width: 40,
                      height: 40,
                      transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                      '&:hover': {
                        backgroundColor: '#7c9885',
                        color: 'white',
                      },
                    }}
                  >
                    <WhatsAppIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </li>
            </ul>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenModal()}
                className="eyebrow text-stone-700 border border-stone-300 px-3 py-1.5"
              >
                Contact
              </button>
              <Tooltip title="Chat on WhatsApp">
                <IconButton
                  href={generateWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  sx={{
                    borderRadius: 0,
                    color: '#7c9885',
                    width: 36,
                    height: 36,
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
                  sx={{ borderRadius: 0 }}
                >
                  <MenuIcon fontSize="medium" />
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
                slotProps={{
                  paper: {
                    sx: {
                      borderRadius: 0,
                      mt: 1,
                      boxShadow: '0 10px 30px -12px rgba(15, 23, 23, 0.18)',
                      minWidth: 180,
                    },
                  },
                }}
              >
                {links.map((el, i) => (
                  <MenuItem
                    component={Link}
                    href={el.link}
                    key={`nav-dropdown-${i}`}
                    onClick={handleClose}
                    sx={{
                      textTransform: 'uppercase',
                      letterSpacing: '0.18em',
                      fontSize: '0.75rem',
                      color: '#44403c',
                      py: 1.25,
                    }}
                  >
                    {el.text}
                  </MenuItem>
                ))}
                <MenuItem
                  onClick={() => handleOpenModal()}
                  sx={{
                    textTransform: 'uppercase',
                    letterSpacing: '0.18em',
                    fontSize: '0.75rem',
                    color: '#7c9885',
                    py: 1.25,
                  }}
                >
                  Contact Form
                </MenuItem>
              </Menu>
            </div>
          )}
        </nav>
      </div>
    </Section>
  );
};
