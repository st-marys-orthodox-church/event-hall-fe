import { Button, IconButton, Menu, MenuItem, Tooltip } from "@mui/material"
import Link from "next/link"
import { useWindowSize, useDropdown } from "../../hooks"
import { Section } from "../layout/Section"
import { Logo } from "./Logo"
import MenuIcon from '@mui/icons-material/Menu';

export const Navbar = () => {
  const {width} = useWindowSize();
  const {open, handleClick, handleClose, anchorEl} = useDropdown();

  const links = [
    {
      text: 'Gallery',
      link: '#gallery'
    },
    {
      text: 'Packages',
      link: '#packages'
    }
  ]
    return (
        <Section yPadding="py-4 md:py-5">

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
              <Button className="text-neutral-900">
                {el.text}
              </Button>
            </Link>
          </li>
        ))}
          <li>
            <Button variant="contained" className="bg-blue-500 hover:bg-blue-600 ml-1">
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
                <Link href={el.link}>
              <MenuItem key={`nav-dropdown-${i}`} className="justify-end" onClick={handleClose}>
              {el.text}
            </MenuItem></Link>
              ))}
              <MenuItem onClick={handleClose} className="text-blue-500">
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
    )
}