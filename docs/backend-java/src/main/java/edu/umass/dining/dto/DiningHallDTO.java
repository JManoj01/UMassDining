package edu.umass.dining.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiningHallDTO {
    private Long id;
    private String name;
    private String location;
    private String specialty;
}
