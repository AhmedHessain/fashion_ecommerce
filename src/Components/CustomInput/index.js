// import React from "react";
// import { Controller } from "react-hook-form";
// import { Box, TextField, Tooltip } from "@mui/material";
// import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// const iconStyle = {
//   position: "absolute",
//   top: "50%",
//   right: "5px",
//   transform: "translateY(-10%)",
//   color: "red",
//   cursor: "pointer",
//   fontSize: "18px",
// };

// const CustomInput = ({
//   name,
//   label,
//   control,
//   showError,
//   errors,
//   type = "text",
//   criteria = [],
// }) => (
//   <Controller
//     name={name}
//     control={control}
//     defaultValue=""
//     render={({ field }) => (
//       <Box sx={{ position: "relative" }}>
//         <TextField
//           error={showError && !!errors[name]}
//           label={label}
//           type={type}
//           variant="standard"
//           fullWidth
//           helperText={showError && errors[name] ? "" : ""}
//           {...field}
//         />

//         {showError && errors[name] && (
//           <Tooltip
//             title={
//               criteria.length > 0 ? (
//                 <Box>
//                   {criteria.map((criteria, index) => (
//                     <div
//                       key={index}
//                       style={{
//                         color: criteria.test.test(field.value)
//                           ? "lightgreen"
//                           : "#FF6C71",
//                       }}
//                     >
//                       {criteria.message}
//                     </div>
//                   ))}
//                 </Box>
//               ) : (
//                 <div className="text-[#FF6C71]">{errors[name].message}</div>
//               )
//             }
//             arrow
//           >
//             <ErrorOutlineIcon sx={iconStyle} />
//           </Tooltip>
//         )}
//         {showError && !errors[name] && field.value && (
//           <Tooltip arrow>
//             <CheckCircleIcon sx={{ ...iconStyle, color: "green" }} />
//           </Tooltip>
//         )}
//       </Box>
//     )}
//   />
// );

// export default CustomInput;
import React from "react";
import { Controller } from "react-hook-form";
import { Box, TextField, Tooltip, IconButton } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const iconStyle = {
  color: "red",
  cursor: "pointer",
  fontSize: "18px",
};

const visibilityIconStyle = {
  transform: "translateY(-27%) translateX(25%)",
  color: "gray",
  cursor: "pointer",
};

const CustomInput = ({
  name,
  label,
  control,
  showError,
  errors,
  type = "text", // General type, defaults to "text"
  showPassword = false, // Show/hide password toggle
  criteria = [],
  setShowPassword, // Callback to handle visibility toggle
}) => (
  <Controller
    name={name}
    control={control}
    defaultValue=""
    render={({ field }) => (
      <Box sx={{ position: "relative" }}>
        <TextField
          error={showError && !!errors[name]}
          label={label}
          type={type === "password" && showPassword ? "text" : type} // Handle password visibility
          variant="standard"
          fullWidth
          helperText={showError && errors[name] ? "" : ""}
          {...field}
        />
        <div className="flex justify-center flex-row-reverse absolute top-[40%] right-1">
          {/* Conditionally render visibility icon for password fields */}
          {type === "password" && (
            <IconButton
              onClick={() => {
                setShowPassword((prevValue) => !prevValue);
              }} // Call external handler to toggle visibility
              sx={visibilityIconStyle}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          )}

          {/* Error icon */}
          {showError && errors[name] && (
            <Tooltip
              title={
                criteria.length > 0 ? (
                  <Box>
                    {criteria.map((criteria, index) => (
                      <div
                        key={index}
                        style={{
                          color: criteria.test.test(field.value)
                            ? "lightgreen"
                            : "#FF6C71",
                        }}
                      >
                        {criteria.message}
                      </div>
                    ))}
                  </Box>
                ) : (
                  <div className="text-[#FF6C71]">{errors[name].message}</div>
                )
              }
              arrow
            >
              <ErrorOutlineIcon sx={iconStyle} />
            </Tooltip>
          )}

          {/* Success icon */}
          {showError && !errors[name] && field.value && (
            <Tooltip arrow>
              <CheckCircleIcon sx={{ ...iconStyle, color: "green" }} />
            </Tooltip>
          )}
        </div>
      </Box>
    )}
  />
);

export default CustomInput;
