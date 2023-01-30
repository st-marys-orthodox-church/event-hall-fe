import { useState } from "react"

export const useContactForm = () => {
    const [contactForm, setContactForm] = useState<any>({
        name: '',
        date: null,
        message: ''
      })
  
      const updateContactForm = (key: string, value: string | Date) => {
        setContactForm({
          ...contactForm,
          [key]: value
        })
      }

      return {
        contactForm,
        updateContactForm
      }
}