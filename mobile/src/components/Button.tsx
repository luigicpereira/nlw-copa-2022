import { Button as ButtonNativeBase, Text, IButtonProps } from "native-base";

interface ButtonProps extends IButtonProps {
  label: String;
  type?: "PRIMARY" | "SECONDARY";
}

export function Button({ label, type, ...rest }: ButtonProps) {
  return (
    <ButtonNativeBase
      w="full"
      h={14}
      rounded="sm"
      fontSize="md"
      textTransform="uppercase"
      bg={type === "SECONDARY" ? "red.500" : "yellow.500"}
      _pressed={{
        bg: type === "SECONDARY" ? "red.600" : "yellow.600",
      }}
      _loading={{
        _spinner: {
          color: type === "SECONDARY" ? "white" : "black",
        },
      }}
      {...rest}
    >
      <Text
        fontSize="sm"
        fontFamily="heading"
        color={type === "SECONDARY" ? "white" : "black"}
      >
        {label}
      </Text>
    </ButtonNativeBase>
  );
}
