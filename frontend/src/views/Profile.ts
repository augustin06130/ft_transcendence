// import TerminalBox, { withTerminalHostname } from "@components/TerminalBox";

// export default function Profile() {
//   const cmdName = withTerminalHostname("./about");
//   return TerminalBox(cmdName);
// }

import { div, p, form, input, label, span, button, img } from "@framework/tags";
import TerminalBox, { footer } from "@components/TerminalBox";
import UseState from "@framework/UseState";
import UseRouter from "@framework/UseRouter";
import { State } from "@framework/types";
import { UserIconSVG } from "@Icon/User";
import { EmailIconSVG, PhoneIconSVG, EditIconSVG, SaveIconSVG} from "@Icon/SetupIcon";  
import { isLogged } from "@framework/auth";

function ProfileForm(
  handleSubmit: (e: Event) => void,
  error: () => string,
  loading: () => boolean,
  editMode: () => boolean,
  toggleEditMode: () => void,
  username: State<string>,
  email: State<string>,
  phone: State<string>,
  bio: State<string>,
  profilePicture: State<string>
) {
  function inputL(
    id: string,
    name: string,
    labelName: string,
    type: string,
    value: () => string,
    onInput: (e: Event) => void,
    placeholder: string,
    icon: SVGSVGElement,
    disabled: boolean = false
  ) {
    return div({ className: "space-y-1" },
      label({ htmlFor: name, className: "text-sm flex items-center gap-2" },
        icon,
        span({}, `${labelName}:`)
      ),
      editMode() && !disabled
        ? input({
            id: id,
            type: type,
            name: name,
            className: "w-full bg-black border border-green-500/30 p-2 text-green-500",
            placeholder: placeholder,
            value: value(),
            event: {
              input: onInput,
            }
          })
        : div({ className: "w-full bg-black border border-green-500/30 p-2 text-green-500" }, value())
    );
  }

  function textareaL(
    id: string,
    name: string,
    labelName: string,
    value: () => string,
    onInput: (e: Event) => void,
    placeholder: string,
    icon: SVGSVGElement
  ) {
    const textarea = document.createElement('textarea');
    textarea.id = id;
    textarea.name = name;
    textarea.className = "w-full bg-black border border-green-500/30 p-2 text-green-500 resize-none h-24";
    textarea.placeholder = placeholder;
    textarea.value = value();
    textarea.addEventListener('input', onInput);

    return div({ className: "space-y-1" },
      label({ htmlFor: name, className: "text-sm flex items-center gap-2" },
        icon,
        span({}, `${labelName}:`)
      ),
      editMode()
        ? textarea
        : div({ className: "w-full bg-black border border-green-500/30 p-2 text-green-500 min-h-24" }, value())
    );
  }

  function profilePictureUpload() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'profile-picture';
    fileInput.name = 'profile-picture';
    fileInput.accept = 'image/*';
    fileInput.className = 'hidden';
    fileInput.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          profilePicture.set(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    });

    return div({ className: "flex flex-col items-center space-y-3" },
      div({ className: "relative w-32 h-32 mx-auto" },
        img({
          src: profilePicture.get() || "/default-avatar.png",
          alt: "Profile Picture",
          className: "w-32 h-32 rounded-full border-2 border-green-500 object-cover"
        }),
        editMode() ? div({
          className: "absolute bottom-0 right-0 bg-black border border-green-500 rounded-full p-1 cursor-pointer hover:bg-green-500/20",
          event: {
            click: () => fileInput.click()
          }
        }, EditIconSVG) : null
      ),
      editMode() ? fileInput : null,
      editMode() ? p({ className: "text-xs text-green-400/70" }, "Click the edit icon to change your profile picture") : null
    );
  }

  const err = error();

  return div({ className: "space-y-6" },
    div({ className: "flex justify-between items-center" },
      p({ className: "text-xl text-green-500 font-bold" }, "USER PROFILE"),
      // button({
      //   className: "border border-green-500 text-green-500 px-3 py-1 hover:bg-green-500/20 flex items-center gap-2",
      //   event: {
      //     click: toggleEditMode
      //   }
      // }, editMode() ? [SaveIconSVG(), "Save"] : [EditIconSVG(), "Edit"])
    ),
    
    profilePictureUpload(),
    
    form({
      className: "space-y-4 mt-6",
      event: {
        submit: handleSubmit
      }
    },
      inputL("username", "username", "USERNAME", "text", username.get, (e) => username.set((e.target as any)?.value), "username", UserIconSVG, true),
      inputL("email", "email", "EMAIL", "email", email.get, (e) => email.set((e.target as any)?.value), "email@example.com", EmailIconSVG),
      inputL("phone", "phone", "PHONE", "tel", phone.get, (e) => phone.set((e.target as any)?.value), "+1234567890", PhoneIconSVG),
      textareaL("bio", "bio", "BIO", bio.get, (e) => bio.set((e.target as any)?.value), "Tell us about yourself...", UserIconSVG),
      
      err ? p({ className: "text-red-500 text-sm" }, error()) : null,
      
      editMode() ? input({
        id: "submit",
        type: "submit",
        className: "w-full py-2 border border-green-500 text-green-500 hover:bg-green-500/20",
        value: "Update Profile"
      }) : null
    )
  );
}

export default function Profile() {
  const router = UseRouter();

  // Initialize state variables
  const username = UseState("", () => {});
  const email = UseState("", () => {});
  const phone = UseState("", () => {});
  const bio = UseState("", () => {});
  const profilePicture = UseState("", () => {});
  const error = UseState("", () => {});
  const loading = UseState(false, () => {});
  const editMode = UseState(false, () => {});
  const updateSuccess = UseState(false, () => {});
  const dataLoaded = UseState(false, () => {});

  // Check if user is logged in and redirect if not
  function checkAuth() {
    if (!isLogged.get()) {
      console.log("User not logged in, redirecting to login page");
      window.dispatchEvent(new CustomEvent("url", { detail: { to: "/login" } }));
      return false;
    }
    return true;
  }

  // Fetch user profile data on component mount
  function fetchUserProfile() {
    if (!checkAuth()) return;
    
    loading.set(true);
    fetch('/api/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        return response.json();
      })
      .then((data) => {
        username.set(data.username || "");
        email.set(data.email || "");
        phone.set(data.phone || "");
        bio.set(data.bio || "");
        profilePicture.set(data.profilePicture || "");
        dataLoaded.set(true);
        loading.set(false);
      })
      .catch((err) => {
        console.error('Error fetching profile:', err);
        error.set(`ERROR: ${err.message}`);
        loading.set(false);
        
        // If there's an authentication error, redirect to login
        if (err.message.includes('authentication') || err.message.includes('unauthorized')) {
          isLogged.set(false);
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("url", { detail: { to: "/login" } }));
          }, 1500);
        }
      });
  }

  // Toggle edit mode
  function toggleEditMode() {
    if (editMode.get()) {
      // If currently in edit mode, submit the form
      handleSubmit(new Event('submit'));
    } else {
      // Otherwise, enter edit mode
      editMode.set(true);
    }
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (!checkAuth()) return;
    
    error.set("");
    loading.set(true);
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('email', email.get());
    formData.append('phone', phone.get());
    formData.append('bio', bio.get());
    
    // If profilePicture is a data URL (new upload), convert to blob and append
    if (profilePicture.get() && profilePicture.get().startsWith('data:')) {
      // Convert data URL to Blob
      const base64Response = fetch(profilePicture.get());
      base64Response.then(res => res.blob()).then(blob => {
        formData.append('profilePicture', blob, 'profile-image.jpg');
        
        // Now send the form data
        sendProfileUpdate(formData);
      });
    } else {
      // Just send the existing profile picture URL
      formData.append('profilePictureUrl', profilePicture.get());
      sendProfileUpdate(formData);
    }
  }
  
  function sendProfileUpdate(formData: FormData) {
    fetch('/api/profile/update', {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to update profile');
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          loading.set(false);
          updateSuccess.set(true);
          editMode.set(false);
          
          // Update local state with returned data if available
          if (data.profile) {
            username.set(data.profile.username || username.get());
            email.set(data.profile.email || email.get());
            phone.set(data.profile.phone || phone.get());
            bio.set(data.profile.bio || bio.get());
            profilePicture.set(data.profile.profilePicture || profilePicture.get());
          }
          
          // Hide success message after a delay
          setTimeout(() => {
            updateSuccess.set(false);
          }, 3000);
        } else {
          throw new Error(data.error || 'Failed to update profile');
        }
      })
      .catch((err) => {
        console.error('Error updating profile:', err);
        error.set(`ERROR: ${err.message}`);
        loading.set(false);
      });
  }

  // Initialize component - fetch user data
  if (!dataLoaded.get() && !loading.get()) {
    fetchUserProfile();
  }

  // Show loading state while fetching data
  if (loading.get() && !dataLoaded.get()) {
    return TerminalBox("terminal@user:~/profile",
      div({ className: "mx-auto max-w-md border border-green-500/30 rounded p-4 bg-black/80 shadow-lg shadow-green-500/10" },
        div({ className: "text-center py-8" },
          p({ className: "text-xl text-green-500" }, "Loading profile data..."),
          div({ className: "mt-4 flex justify-center" },
            div({ className: "h-2 w-2 bg-green-500 rounded-full animate-pulse mr-1" }),
            div({ className: "h-2 w-2 bg-green-500 rounded-full animate-pulse mr-1" }),
            div({ className: "h-2 w-2 bg-green-500 rounded-full animate-pulse" })
          )
        )
      ),
      footer()
    );
  }

  // Render the profile content
  const profileContent = ProfileForm(
    handleSubmit,
    error.get,
    loading.get,
    editMode.get,
    toggleEditMode,
    username,
    email,
    phone,
    bio,
    profilePicture
  );

  // prettier-ignore
  return TerminalBox("terminal@user:~/profile",
    div({ className: "mx-auto max-w-md border border-green-500/30 rounded p-4 bg-black/80 shadow-lg shadow-green-500/10" },
      updateSuccess.get() 
        ? div({ className: "bg-green-500/20 border border-green-500 p-2 mb-4 text-green-400 text-sm" }, 
            "Profile updated successfully"
          ) 
        : null,
      profileContent,
      div({ className: "mt-6 text-green-400/70 text-xs border-t border-green-500/30 pt-4" },
        p({}, `$ Last updated: ${new Date().toLocaleString()}`),
        // p({}, "$ System status: Online"),
        p({}, `$ System status: ${isLogged.get() ? "Online" : "Offline"}`),
        p({}, 
          button({
            className: "text-green-400/70 hover:text-green-400 mt-1",
            event: {
              click: () => {
                window.dispatchEvent(new CustomEvent("url", { detail: { to: "/" } }));
              }
            }
          }, "$ cd ~")
        )
      )
    ),
    footer()
  );
}