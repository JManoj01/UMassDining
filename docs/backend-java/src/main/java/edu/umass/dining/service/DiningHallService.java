package edu.umass.dining.service;

import edu.umass.dining.dto.DiningHallDTO;
import edu.umass.dining.model.DiningHall;
import edu.umass.dining.repository.DiningHallRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiningHallService {
    private final DiningHallRepository diningHallRepository;

    @Cacheable("diningHalls")
    public List<DiningHallDTO> getAllDiningHalls() {
        return diningHallRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private DiningHallDTO toDTO(DiningHall hall) {
        return DiningHallDTO.builder()
                .id(hall.getId())
                .name(hall.getName())
                .location(hall.getLocation())
                .specialty(hall.getSpecialty())
                .build();
    }
}
