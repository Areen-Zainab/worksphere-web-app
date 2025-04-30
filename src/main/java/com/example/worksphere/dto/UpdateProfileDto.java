package com.example.worksphere.dto;

import java.time.LocalDate;
import jakarta.validation.constraints.Past;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProfileDto {
    private String firstName;
    private String lastName;
    private String bio;
    private String gender;

    @Past(message = "Date of birth must be in the past.")
    private LocalDate dob;
}
